// Doughnut: cap-wise equity distribution
fetch("http://localhost:3000/api/investment/Equity")
  .then(res => res.json())
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) return;
    const labels = data.map(x => x.sub_category);
    const values = data.map(x => parseFloat(x.total));
    window.makeDoughnut("equityDoughnut", labels, values, "Equity Distribution");
});

// Scatter: buy/sell history (amount per transaction)
fetch("http://localhost:3000/api/buy-sell/Equity")
  .then(res => res.json())
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) return;
    const buyPoints = [], sellPoints = [];
    data.forEach(tx => {
      if (!tx.date || !tx.amount) return;
      const point = { x: tx.date.substr(0, 10), y: parseFloat(tx.amount) };
      if (tx.type === "BUY") buyPoints.push(point);
      else if (tx.type === "SELL") sellPoints.push(point);
    });
    const ctx = document.getElementById("equityTransGraph").getContext("2d");
    new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: "Buy",
            data: buyPoints,
            backgroundColor: "#1E88E5",
            borderColor: "#1E88E5cc",
            pointRadius: 6,
            showLine: false
          },
          {
            label: "Sell",
            data: sellPoints,
            backgroundColor: "#E53935",
            borderColor: "#E53935cc",
            pointRadius: 6,
            showLine: false
          }
        ]
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        scales: {
          x: { type: 'time', time: { unit: 'month', tooltipFormat:'YYYY-MM-DD' }, title: {display:true,text:'Date'} },
          y: { beginAtZero: false, title: {display:true, text:'Amount (₹)'} }
        }
      }
    });
});
