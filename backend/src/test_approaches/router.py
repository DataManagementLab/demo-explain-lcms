import dgl
import dgl.nn.pytorch
from fastapi import APIRouter
import torch


router = APIRouter(tags=["test_approaches"])


class GNNExplainerTestModel(torch.nn.Module):
    def __init__(self, in_dim, num_classes, canonical_etypes):
        super(GNNExplainerTestModel, self).__init__()
        self.etype_weights = torch.nn.ModuleDict({"_".join(c_etype): torch.nn.Linear(in_dim, num_classes) for c_etype in canonical_etypes})

    def forward(self, graph: dgl.DGLHeteroGraph, feat: dict[str, torch.Tensor], eweight=None):
        with graph.local_scope():
            c_etype_func_dict = {}
            for c_etype in graph.canonical_etypes:
                src_type, etype, dst_type = c_etype
                wh = self.etype_weights["_".join(c_etype)](feat[src_type])
                graph.nodes[src_type].data[f"h_{c_etype}"] = wh
                if eweight is None:
                    c_etype_func_dict[c_etype] = (dgl.function.copy_u(f"h_{c_etype}", "m"), dgl.function.mean("m", "h"))
                else:
                    graph.edges[c_etype].data["w"] = eweight[c_etype]
                    c_etype_func_dict[c_etype] = (dgl.function.u_mul_e(f"h_{c_etype}", "w", "m"), dgl.function.mean("m", "h"))
            graph.multi_update_all(c_etype_func_dict, "sum")
            hg = 0
            for ntype in graph.ntypes:
                if graph.num_nodes(ntype):
                    hg = hg + dgl.mean_nodes(graph, "h", ntype=ntype)
            return hg


class GNNExplainerTestData:
    is_trained = False
    g: dgl.DGLHeteroGraph = None
    model: GNNExplainerTestModel
    feat: dict[str, torch.Tensor]
    explainer: dgl.nn.pytorch.explain.HeteroGNNExplainer

    def __init__(self):
        input_dim = 5
        num_classes = 2
        self.g = dgl.heterograph({("user", "plays", "game"): ([0, 1, 1, 2], [0, 0, 1, 1])})
        self.g.nodes["user"].data["h"] = torch.randn(self.g.num_nodes("user"), input_dim)
        self.g.nodes["game"].data["h"] = torch.randn(self.g.num_nodes("game"), input_dim)

        transform = dgl.transforms.AddReverse()
        self.g = transform(self.g)

        # define and train the model
        self.model = GNNExplainerTestModel(input_dim, num_classes, self.g.canonical_etypes)
        self.feat = self.g.ndata["h"]

    def train(self):
        if self.is_trained:
            return
        optimizer = torch.optim.Adam(self.model.parameters())
        for epoch in range(200):
            logits = self.model(self.g, self.feat)
            loss = torch.nn.functional.cross_entropy(logits, torch.tensor([1]))
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        print("Trained")
        self.explainer = dgl.nn.pytorch.explain.HeteroGNNExplainer(self.model, num_hops=1)
        self.is_trained = True


gnnexplainer_test_data = GNNExplainerTestData()


@router.get("/optimizer")
def test_optimizer():
    # Initialize the parameters you want to train
    param1 = torch.nn.Parameter(torch.randn(1))
    param2 = torch.nn.Parameter(torch.randn(1))
    param3 = torch.nn.Parameter(torch.randn(1))

    # Use a list to manage multiple parameters
    params = [param1, param2, param3]

    def objective_function(param1, param2, param3, target):
        # Example function: quadratic function we want to minimize
        result = param1**2 + param2**2 + param3**2
        loss = (result - target).abs()  # L1 loss between the result and the target
        return loss

    optimizer = torch.optim.Adam(params, lr=0.01)
    target_value = torch.tensor([1.0])

    num_epochs = 1000
    for epoch in range(num_epochs):
        optimizer.zero_grad()  # Clear the gradients

        # Calculate the loss
        loss = objective_function(param1, param2, param3, target_value)

        loss.backward()  # Compute gradients
        optimizer.step()  # Update parameters

        if (epoch + 1) % 10 == 0:
            print(f"Epoch [{epoch + 1}/{num_epochs}], Loss: {loss.item():.4f}")
            print(f"param1: {param1.item():.4f}, param2: {param2.item():.4f}, param3: {param3.item():.4f}")

    print(f"Final parameters: param1={param1.item()}, param2={param2.item()}, param3={param3.item()}")
    print(f"Result = {param1.item()**2 + param2.item()**2 + param3.item()**2}")


@router.get("/gnnexplainer_dgl")
def test_gnnexplainer():
    # Explain for the graph
    gnnexplainer_test_data.train()
    model = gnnexplainer_test_data.model
    g = gnnexplainer_test_data.g
    feat = gnnexplainer_test_data.feat
    prediction: torch.Tensor = model(g, feat)
    print("Prediciton", prediction)
    feat_mask, edge_mask = gnnexplainer_test_data.explainer.explain_graph(g, feat)
    # print(feat_mask)
    print(edge_mask)
    return {
        "prediction": prediction.tolist()[0],
        "edge_mask": {"_".join(edge_type): tensor.tolist() for edge_type, tensor in edge_mask.items()},
    }


@router.get("/tensors")
def test_tensors():
    a1 = torch.tensor([1.0, 2.0, 3.0])
    a2 = torch.tensor([1.0, 2.0, 3.0])
    m1 = torch.tensor([1.0, 2.0, 3.0])
    m2 = torch.tensor([1.0, 2.0, 3.0])
    b = torch.tensor([4, 4, 4])

    a1 += b * 0.5
    a2.add_(b, alpha=0.5)

    print(a1)
    print(a2)

    m1 *= b * 0.5
    m2.mul_(b * 0.5)

    print(m1)
    print(m2)
