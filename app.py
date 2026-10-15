import yfinance as yf
from flask import request, render_template, jsonify, Flask

app = Flask(__name__, template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    ticker = request.get_json().get('ticker')
    if not ticker:
        return jsonify({'error': 'No ticker provided'}), 400

    try:
        stock = yf.Ticker(ticker)
        # Fetch today's data
        data = stock.history(period='1d')
        if data.empty:
            return jsonify({'error': 'No data found for this ticker'}), 404

        current_price = data['Close'].iloc[-1]
        open_price = data['Open'].iloc[-1]

        return jsonify({
            'currentPrice': current_price,
            'openPrice': open_price
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)