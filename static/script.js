var tickers = JSON.parse(localStorage.getItem('tickers') || '[]');
var lastPrices = {};
var counter = 15;

function startUpdateCycle() {
    updatePrices();
    setInterval(() => {
        counter--;
        $('#counter').text(counter);
        if (counter <= 0) {
            updatePrices();
            counter = 15;
        }
    }, 1000);
}

$(document).ready(() => {
    tickers.forEach(ticker => addTickerToGrid(ticker));

    $('#add-ticker-form').submit(function (e) {
        e.preventDefault();
        var newTicker = $('#new-ticker').val()?.toString().toUpperCase();
        if (newTicker && !tickers.includes(newTicker)) {
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers));
            addTickerToGrid(newTicker);
        }
        $('#new-ticker').val('');
        updatePrices();
    });

    $('#tickers-grid').on('click', '.remove-btn', function () {
        var tickerToRemove = $(this).data('ticker');
        tickers = tickers.filter(t => t !== tickerToRemove);
        localStorage.setItem('tickers', JSON.stringify(tickers));
        $(`#${tickerToRemove}`).remove();
    });

    startUpdateCycle();
});

function addTickerToGrid(ticker) {
    $('#tickers-grid').append(`
        <div id="${ticker}" class="stock-box">
            <h2>${ticker}</h2>
            <p id="${ticker}-price">$0.00</p>
            <p id="${ticker}-pct">0.00%</p>
            <button class="remove-btn" data-ticker="${ticker}">Remove</button>
        </div>
    `);
}

async function updatePrices() {
    for (let ticker of tickers) {
        try {
            const response = await fetch('/get_stock_data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker })
            });
            const data = await response.json();
            if (response.ok) {
                const changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                const colorClass = getColorClass(changePercent);

                $(`#${ticker}-price`).text(`$${data.currentPrice.toFixed(2)}`);
                $(`#${ticker}-pct`).text(`${changePercent.toFixed(2)}%`);

                $(`#${ticker}-price, #${ticker}-pct`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);

                addFlashEffect(ticker, data.currentPrice);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
}

function getColorClass(changePercent) {
    if (changePercent <= -2) return 'dark-red';
    if (changePercent < 0) return 'red';
    if (changePercent === 0) return 'gray';
    if (changePercent <= 2) return 'green';
    return 'dark-green';
}

function addFlashEffect(ticker, currentPrice) {
    const flashClass = lastPrices[ticker] > currentPrice ? 'red-flash' :
                       lastPrices[ticker] < currentPrice ? 'green-flash' : 'gray-flash';
    lastPrices[ticker] = currentPrice;
    $(`#${ticker}`).addClass(flashClass);
    setTimeout(() => $(`#${ticker}`).removeClass(flashClass), 1000);
}