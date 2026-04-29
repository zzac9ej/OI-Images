# TAIFEX Market Data Analysis & Visualization

## 📋 Overview
This project focuses on automated data extraction, processing, and analysis of market data from the **Taiwan Futures Exchange (TAIFEX)**. It demonstrates the ability to handle large financial datasets and derive actionable market insights using Python.

## 🛠 Tech Stack
* **Language:** Python 3.x
* **Libraries:** * `Pandas` & `NumPy`: For data cleaning and numerical analysis.
  * `Matplotlib` & `Seaborn`: For data visualization and trend analysis.
  * `Requests` / `Selenium`: For automated data scraping from TAIFEX.
* **Storage:** CSV / Excel / SQL.

## 🚀 Key Analysis Features
* **Automated Data Ingestion:** Developed scripts to fetch daily trading information, including price, volume, and Open Interest (OI).
* **Technical Indicator Calculation:** Implementation of custom indicators such as Moving Averages, Volatility measures, and VPIN (Volume-Synchronized Probability of Informed Trading).
* **Market Sentiment Analysis:** Analyzing the ratio of institutional investors' positions to gauge market direction.
* **Data Visualization:** Generating candlestick charts and multi-factor correlation heatmaps to identify trading opportunities.

## 📊 Sample Results
* **Trend Identification:** Successfully modeled historical price movements of Taiwan Index Futures (TX).
* **Volume Analysis:** Correlated volume spikes with price volatility to identify market stress points.

## 📂 Project Structure
* `/data`: Sample raw data retrieved from TAIFEX.
* `/notebooks`: Jupyter Notebooks containing step-by-step analysis.
* `/scripts`: Python scripts for automated data fetching.
* `/output`: Generated charts and summary reports.
