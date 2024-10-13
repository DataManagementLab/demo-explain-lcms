from typing import Optional
from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.orm.attributes import InstrumentedAttribute
from query.db import Base
from zero_shot_learned_db.explanations.data_models import nodes
from zero_shot_learned_db.explanations.data_models import workload_run
from zero_shot_learned_db.explanations.load import ParsedPlanStats


def get_kwargs(db_model: Base, data_fields: list[InstrumentedAttribute]):
    kwargs = {k.key: getattr(db_model, k.key) for k in data_fields}
    return kwargs


class TableStats(Base):
    __tablename__ = "tables"

    id: Mapped[int] = mapped_column(primary_key=True)
    database_stats_id: Mapped[int] = mapped_column(ForeignKey("database_stats.id"))
    database_stats: Mapped["DatabaseStats"] = relationship(back_populates="table_stats")
    id_in_run: Mapped[int]
    relname: Mapped[str]
    reltuples: Mapped[float]
    relpages: Mapped[int]
    node_type: Mapped[str]

    def to_pydantic(self):
        kwargs = get_kwargs(self, [TableStats.relname, TableStats.relpages, TableStats.reltuples])
        return nodes.TableStats(**kwargs)


class ColumnStats(Base):
    __tablename__ = "columns"

    id: Mapped[int] = mapped_column(primary_key=True)
    database_stats_id: Mapped[int] = mapped_column(ForeignKey("database_stats.id"))
    database_stats: Mapped["DatabaseStats"] = relationship(back_populates="column_stats")
    id_in_run: Mapped[int]
    tablename: Mapped[str]
    table_id: Mapped[int] = mapped_column(ForeignKey(TableStats.id))
    table: Mapped[TableStats] = relationship()
    attname: Mapped[str]
    null_frac: Mapped[float]
    avg_width: Mapped[int]
    n_distinct: Mapped[float]
    correlation: Mapped[float | None]
    data_type: Mapped[str]
    table_size: Mapped[float]
    node_type: Mapped[str]

    def to_pydantic(self):
        kwargs = get_kwargs(
            self,
            [
                ColumnStats.tablename,
                ColumnStats.attname,
                ColumnStats.null_frac,
                ColumnStats.avg_width,
                ColumnStats.n_distinct,
                ColumnStats.correlation,
                ColumnStats.data_type,
                ColumnStats.table_size,
            ],
        )
        return nodes.ColumnStats(**kwargs)


class OutputColumn(Base):
    __tablename__ = "output_columns"

    id: Mapped[int] = mapped_column(primary_key=True)
    aggregation: Mapped[str | None]
    columns: Mapped[list[ColumnStats]] = relationship(secondary="output_columns_columns")
    node_type: Mapped[str]
    top_plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"))
    top_plan: Mapped["Plan"] = relationship()

    def to_pydantic(self):
        kwargs = get_kwargs(self, [OutputColumn.aggregation])
        return nodes.OutputColumn(**kwargs, columns=[c.id_in_run for c in self.columns])


class OutputColumnColumn(Base):
    __tablename__ = "output_columns_columns"

    column_id: Mapped[int] = mapped_column(ForeignKey(ColumnStats.id), primary_key=True)
    output_column_id: Mapped[int] = mapped_column(ForeignKey(OutputColumn.id), primary_key=True)


class LogicalPredicate(Base):
    __tablename__ = "logical_nodes"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str]
    operator: Mapped[str]
    parent_id: Mapped[int | None] = mapped_column(ForeignKey(id))
    parent: Mapped[Optional["LogicalPredicate"]] = relationship(back_populates="children", remote_side=[id])
    children: Mapped[list["LogicalPredicate"]] = relationship(back_populates="parent")
    node_type: Mapped[str]
    top_plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"))
    top_plan: Mapped["Plan"] = relationship()

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "logical_predicate",
    }

    def to_pydantic(self):
        kwargs = get_kwargs(self, [LogicalPredicate.operator])
        return nodes.LogicalPredicate(**kwargs, children=[child.to_pydantic() for child in self.children])


class FilterColumn(LogicalPredicate):
    column_id: Mapped[int] = mapped_column(ForeignKey(ColumnStats.id), nullable=True)
    column: Mapped[int] = mapped_column(nullable=True)
    column_stats: Mapped[ColumnStats] = relationship()
    literal: Mapped[str] = mapped_column(nullable=True)
    literal_feature: Mapped[str] = mapped_column(nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "filter_column",
    }

    def to_pydantic(self):
        kwargs = get_kwargs(
            self,
            [
                FilterColumn.operator,
                FilterColumn.column,
                FilterColumn.literal_feature,
                FilterColumn.literal,
            ],
        )
        return nodes.FilterColumn(**kwargs, children=[])


class FilterColumnColumn(Base):
    __tablename__ = "filter_columns_columns"

    column_id: Mapped[int] = mapped_column(ForeignKey(ColumnStats.id), primary_key=True)
    filter_column_id: Mapped[int] = mapped_column(ForeignKey(FilterColumn.id), primary_key=True)


class PlanParameters(Base):
    __tablename__ = "plan_parameters"

    id: Mapped[int] = mapped_column(primary_key=True)
    table: Mapped[int | None]
    op_name: Mapped[str]
    est_startup_cost: Mapped[float]
    est_cost: Mapped[float]
    est_card: Mapped[float]
    est_width: Mapped[float]
    act_startup_cost: Mapped[float]
    act_time: Mapped[float]
    act_card: Mapped[float]
    act_children_card: Mapped[float]
    est_children_card: Mapped[float]
    workers_planned: Mapped[int]
    output_columns: Mapped[list[OutputColumn]] = relationship(secondary="plan_output_columns")
    logical_node_id: Mapped[int | None] = mapped_column(ForeignKey(LogicalPredicate.id))
    filter_columns: Mapped[LogicalPredicate | None] = relationship()
    inner_unique: Mapped[bool | None]

    # Deep DB
    est_pg: Mapped[int | None]
    est_deepdb: Mapped[int | None]
    dd_est_card: Mapped[float | None]
    dd_est_children_card: Mapped[float | None]

    def to_pydantic(self):
        kwargs = get_kwargs(
            self,
            [
                PlanParameters.table,
                PlanParameters.op_name,
                PlanParameters.est_startup_cost,
                PlanParameters.est_cost,
                PlanParameters.est_card,
                PlanParameters.est_width,
                PlanParameters.act_startup_cost,
                PlanParameters.act_time,
                PlanParameters.act_card,
                PlanParameters.act_children_card,
                PlanParameters.est_children_card,
                PlanParameters.workers_planned,
                PlanParameters.inner_unique,
                PlanParameters.est_pg,
                PlanParameters.est_deepdb,
                PlanParameters.dd_est_card,
                PlanParameters.dd_est_children_card,
            ],
        )
        return nodes.PlanParameters(
            **kwargs,
            output_columns=[c.to_pydantic() for c in self.output_columns],
            filter_columns=self.filter_columns.to_pydantic() if self.filter_columns is not None else None,
        )


class PlanOutputColumn(Base):
    __tablename__ = "plan_output_columns"

    plan_parameters_id: Mapped[int] = mapped_column(ForeignKey(PlanParameters.id), primary_key=True)
    output_column_id: Mapped[int] = mapped_column(ForeignKey(OutputColumn.id), primary_key=True)


class PlanStats(Base):
    __tablename__ = "plan_stats"
    id: Mapped[int] = mapped_column(primary_key=True)

    tables: Mapped[int]
    columns: Mapped[int]
    plans: Mapped[int]
    joins: Mapped[int]
    predicates: Mapped[int]
    order_by: Mapped[bool]

    def to_pydantic(self):
        kwargs = get_kwargs(
            self,
            [
                PlanStats.tables,
                PlanStats.columns,
                PlanStats.plans,
                PlanStats.joins,
                PlanStats.predicates,
                PlanStats.order_by,
            ],
        )
        return ParsedPlanStats(**kwargs)


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    id_in_run: Mapped[int | None]
    plan_parameters_id: Mapped[int] = mapped_column(ForeignKey(PlanParameters.id))
    plan_parameters: Mapped[PlanParameters] = relationship()
    plan_runtime: Mapped[float]
    parent_id: Mapped[int | None] = mapped_column(ForeignKey(id))
    parent: Mapped[Optional["Plan"]] = relationship(back_populates="children", remote_side=[id], foreign_keys=[parent_id])
    children: Mapped[list["Plan"]] = relationship(back_populates="parent", foreign_keys=[parent_id])
    database_id: Mapped[int]
    node_type: Mapped[str]
    workload_run_id: Mapped[int | None] = mapped_column(ForeignKey("workload_runs.id"))
    workload_run: Mapped[Optional["WorkloadRun"]] = relationship(back_populates="parsed_plans")
    sql: Mapped[str | None]
    top_plan_id: Mapped[int | None] = mapped_column(ForeignKey(id))
    top_plan: Mapped[Optional["Plan"]] = relationship(foreign_keys=[top_plan_id], remote_side=[id])
    plan_stats_id: Mapped[int | None] = mapped_column(ForeignKey(PlanStats.id))
    plan_stats: Mapped[PlanStats | None] = relationship()

    # plain_content: list
    # join_conds: list[str]

    def to_pydantic(self):
        kwargs = get_kwargs(self, [Plan.plan_runtime, Plan.database_id, Plan.sql])
        return nodes.Plan(
            **kwargs,
            plan_parameters=self.plan_parameters.to_pydantic(),
            children=[c.to_pydantic() for c in self.children],
        )


class RunKwargs(Base):
    __tablename__ = "run_kwargs"

    id: Mapped[int] = mapped_column(primary_key=True)
    hardware: Mapped[str]


class DatabaseStats(Base):
    __tablename__ = "database_stats"

    id: Mapped[int] = mapped_column(primary_key=True)
    column_stats: Mapped[list[ColumnStats]] = relationship(back_populates="database_stats")
    table_stats: Mapped[list[TableStats]] = relationship(back_populates="database_stats")
    run_kwargs_id: Mapped[int | None] = mapped_column(ForeignKey(RunKwargs.id))
    run_kwargs: Mapped[RunKwargs | None] = relationship()

    def to_pydantic(self):
        return workload_run.DatabaseStats(
            column_stats=[c.to_pydantic() for c in sorted(self.column_stats, key=lambda x: x.id_in_run)],
            table_stats=[t.to_pydantic() for t in sorted(self.table_stats, key=lambda x: x.id_in_run)],
        )


class WorkloadRun(Base):
    __tablename__ = "workload_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    file_name: Mapped[str]
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.id"))
    dataset: Mapped["Dataset"] = relationship(back_populates="runs")
    parsed_plans: Mapped[list[Plan]] = relationship(back_populates="workload_run")
    database_stats_id: Mapped[int] = mapped_column(ForeignKey(DatabaseStats.id))
    database_stats: Mapped[DatabaseStats] = relationship()
    run_kwargs_id: Mapped[int] = mapped_column(ForeignKey(RunKwargs.id))
    run_kwargs: Mapped[RunKwargs] = relationship()


class Dataset(Base):
    __tablename__ = "datasets"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    directory: Mapped[str]
    runs: Mapped[list[WorkloadRun]] = relationship(back_populates="dataset")
