import numpy as np
from sklearn.linear_model import LinearRegression


def train_model():
    # 1. Clean, valid numbers for your data arrays
    X = np.array([[1], [2], [3], [4], [5], [6], [7], [8], [9], [10]])
    y = np.array([15, 25, 35, 42, 50, 61, 72, 80, 89, 100])

    # 2. Initialize the Linear Regression model
    model = LinearRegression()

    # 3. Fit the model to the training data
    model.fit(X, y)

    # 4. Display model parameters to demonstrate success
    print("--- Linear Regression Model Trained Successfully ---")
    print(f"Slope (Coefficient): {model.coef_[0]:.2f}")
    print(f"Intercept: {model.intercept_:.2f}")

    # 5. Run a quick validation test
    test_hours = np.array([[5.5]])
    predicted_score = model.predict(test_hours)
    print(f"Prediction for 5.5 study hours: {predicted_score[0]:.2f}")


if __name__ == "__main__":
    train_model()
