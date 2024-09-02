from fastapi import APIRouter
import torch

router = APIRouter(tags=["test_approaches"])


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
