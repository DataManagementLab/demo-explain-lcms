from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from query.db import Base


class ColumnStats(Base):
    __tablename__ = "columns"

    id: Mapped[int] = mapped_column(primary_key=True)
    database_stats_id: Mapped[int] = mapped_column(ForeignKey("database_stats.id"))
    id_in_run = Mapped[int]
    tablename: Mapped[str]
    attname: Mapped[str]
    null_frac: Mapped[float]
    avg_width: Mapped[int]
    n_distinct: Mapped[float]
    correlation: Mapped[float | None]
    data_type: Mapped[str]
    table_size: Mapped[float]
    node_type: Mapped[str]


class TableStats(Base):
    __tablename__ = "tables"

    id: Mapped[int] = mapped_column(primary_key=True)
    database_stats_id: Mapped[int] = mapped_column(ForeignKey("database_stats.id"))
    id_in_run = Mapped[int]
    relname: Mapped[str]
    reltuples: Mapped[float]
    relpages: Mapped[int]
    node_type: Mapped[str]


class OutputColumn(Base):
    __tablename__ = "output_columns"

    id: Mapped[int] = mapped_column(primary_key=True)
    aggregation: Mapped[str]
    columns: Mapped[list[ColumnStats]] = relationship(secondary="output_columns_columns")
    node_type: Mapped[str]


class OutputColumnColumn(Base):
    __tablename__ = "output_columns_columns"

    column_id: Mapped[int] = mapped_column(ForeignKey(ColumnStats.id), primary_key=True)
    output_column_id: Mapped[int] = mapped_column(ForeignKey(OutputColumn.id), primary_key=True)


class LogicalNodeChild(Base):
    __tablename__ = "logical_nodes_children"

    node_id: Mapped[int] = mapped_column(ForeignKey("logical_nodes.id"), primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("logical_nodes.id"), primary_key=True)


class LogicalPredicate(Base):
    __tablename__ = "logical_nodes"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str]
    operator: Mapped[str]
    children: Mapped[list["LogicalPredicate"]] = relationship(secondary="logical_nodes_children", primaryjoin=id == LogicalNodeChild.node_id, secondaryjoin=id == LogicalNodeChild.child_id)
    node_type: Mapped[str]

    __mapper_args__ = {
        "polymorphic_on": "type",
        "polymorphic_identity": "logical_predicate",
    }


class FilterColumn(LogicalPredicate):
    column_id: Mapped[int] = mapped_column(ForeignKey(ColumnStats.id), nullable=True)
    column: Mapped[int] = mapped_column(nullable=True)
    column_stats: Mapped[ColumnStats] = relationship()
    # literal: Mapped[str] = mapped_column(nullable=True)  # Mapped[str | int | float]
    literal_feature: Mapped[str] = mapped_column(nullable=True)

    __mapper_args__ = {
        "polymorphic_identity": "filter_column",
    }


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
    act_startup_cost: Mapped[float | None]
    act_time: Mapped[float | None]
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


class PlanOutputColumn(Base):
    __tablename__ = "plan_output_columns"

    plan_parameters_id: Mapped[int] = mapped_column(ForeignKey(PlanParameters.id), primary_key=True)
    output_column_id: Mapped[int] = mapped_column(ForeignKey(OutputColumn.id), primary_key=True)


class PlanChild(Base):
    __tablename__ = "plan_children"

    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), primary_key=True)
    child_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), primary_key=True)


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    plan_parameters_id: Mapped[int] = mapped_column(ForeignKey(PlanParameters.id))
    plan_parameters: Mapped[PlanParameters] = relationship()
    plan_runtime: Mapped[float]
    children: Mapped[list["Plan"]] = relationship(secondary="plan_children", primaryjoin=id == PlanChild.plan_id, secondaryjoin=id == PlanChild.child_id)
    database_id: Mapped[int]
    node_type: Mapped[str]
    workload_run_id: Mapped[int | None] = mapped_column(ForeignKey("workload_runs.id"))

    # plain_content: list
    # join_conds: list[str]


class RunKwargs(Base):
    __tablename__ = "run_kwargs"

    id: Mapped[int] = mapped_column(primary_key=True)
    hardware: Mapped[str]


class DatabaseStats(Base):
    __tablename__ = "database_stats"

    id: Mapped[int] = mapped_column(primary_key=True)
    column_stats: Mapped[list[ColumnStats]] = relationship()
    table_stats: Mapped[list[TableStats]] = relationship()
    run_kwargs_id: Mapped[int | None] = mapped_column(ForeignKey(RunKwargs.id))
    run_kwargs: Mapped[RunKwargs | None] = relationship()


class WorkloadRun(Base):
    __tablename__ = "workload_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    file_name: Mapped[str]
    parsed_plans: Mapped[list[Plan]] = relationship()
    database_stats_id: Mapped[int] = mapped_column(ForeignKey(DatabaseStats.id))
    database_stats: Mapped[DatabaseStats] = relationship()
    run_kwargs_id: Mapped[int] = mapped_column(ForeignKey(RunKwargs.id))
    run_kwargs: Mapped[RunKwargs] = relationship()
