import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import joblib

# =========================
# LOAD DATA
# =========================
customer_data = pd.read_csv("Mall_Customers.csv")

print(customer_data.head())
print("Shape:", customer_data.shape)
print(customer_data.info())
print("Null values:\n", customer_data.isnull().sum())

# =========================
# SMART COLUMN STANDARDIZATION
# =========================
def standardize_columns(df):
    df = df.copy()

    rename_map = {
        # ID
        "ID": "CustomerID",
        "customerid": "CustomerID",

        # Age
        "age": "Age",

        # Gender
        "sex": "Gender",

        # Income variations
        "income": "Annual Income (k$)",
        "annual income": "Annual Income (k$)",
        "AnnualIncome": "Annual Income (k$)",

        # Spending score variations
        "spending score": "Spending Score (1-100)",
        "spending_score": "Spending Score (1-100)",
        "score": "Spending Score (1-100)"
    }

    df.columns = [c.strip() for c in df.columns]
    df.rename(columns=rename_map, inplace=True)

    return df

customer_data = standardize_columns(customer_data)

# =========================
# REQUIRED COLUMN CHECK + CREATION
# =========================
required_cols = [
    "CustomerID",
    "Age",
    "Gender",
    "Annual Income (k$)",
    "Spending Score (1-100)"
]

# If missing columns exist → create safe defaults
if "Annual Income (k$)" not in customer_data.columns:
    if "Income" in customer_data.columns:
        customer_data["Annual Income (k$)"] = customer_data["Income"]
    else:
        customer_data["Annual Income (k$)"] = 0

if "Spending Score (1-100)" not in customer_data.columns:
    customer_data["Spending Score (1-100)"] = 50  # neutral default

if "Age" not in customer_data.columns:
    customer_data["Age"] = 30

if "Gender" not in customer_data.columns:
    customer_data["Gender"] = "Unknown"

# Keep only needed columns if available
for col in required_cols:
    if col not in customer_data.columns:
        customer_data[col] = np.nan

customer_data = customer_data[required_cols]

# =========================
# CLEANING
# =========================
customer_data = customer_data.drop_duplicates()
customer_data = customer_data.fillna(customer_data.mean(numeric_only=True))

# fill categorical
customer_data["Gender"] = customer_data["Gender"].fillna("Unknown")

# =========================
# VISUALIZATION
# =========================
plt.figure(figsize=(12, 5))

plt.subplot(1, 2, 1)
sns.histplot(customer_data['Annual Income (k$)'], bins=20, kde=True)
plt.title('Distribution of Annual Income')

plt.subplot(1, 2, 2)
sns.histplot(customer_data['Spending Score (1-100)'], bins=20, kde=True)
plt.title('Distribution of Spending Score')

plt.show()

if 'Gender' in customer_data.columns:
    sns.boxplot(x='Gender', y='Spending Score (1-100)', data=customer_data)
    plt.title('Spending Score by Gender')
    plt.show()

# =========================
# FEATURE SELECTION
# =========================
features = ['Annual Income (k$)', 'Spending Score (1-100)']
X = customer_data[features].values

# =========================
# SCALING
# =========================
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# =========================
# ELBOW METHOD
# =========================
wcss = []

for i in range(1, 11):
    km = KMeans(n_clusters=i, init='k-means++', random_state=42)
    km.fit(X_scaled)
    wcss.append(km.inertia_)

plt.plot(range(1, 11), wcss, marker='o')
plt.title('Elbow Method')
plt.xlabel('Clusters')
plt.ylabel('WCSS')
plt.show()

# =========================
# FINAL MODEL
# =========================
kmeans = KMeans(n_clusters=5, init='k-means++', random_state=42)
y = kmeans.fit_predict(X_scaled)

customer_data['Cluster'] = y

# =========================
# EVALUATION
# =========================
score = silhouette_score(X_scaled, kmeans.labels_)
print("Silhouette Score:", score)

# =========================
# SAVE MODEL + SCALER
# =========================
joblib.dump(kmeans, "kmeans_model.pkl")
joblib.dump(scaler, "scaler.pkl")

print("✅ Model and scaler saved successfully!")

# =========================
# TEST PREDICTIONS
# =========================
model = joblib.load("kmeans_model.pkl")
scaler = joblib.load("scaler.pkl")

test_data = [
    [20, 20],
    [80, 90],
    [50, 50],
    [90, 20],
    [20, 80]
]

print("\nTest Predictions:")

for customer in test_data:
    scaled = scaler.transform([customer])
    cluster = model.predict(scaled)[0]
    print(f"Customer {customer} → Cluster {cluster}")