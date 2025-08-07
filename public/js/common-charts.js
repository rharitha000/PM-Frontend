// common-charts.js
window.makeDoughnut = function(canvasId, labels, values, label, legendPosition = 'bottom') {
    let colors = [
        "#2461A4", "#45BA48", "#E8B923", "#BB3535",
        "#277DA1", "#F3722C", "#43AA8B", "#f9844a"
    ];
    return new Chart(document.getElementById(canvasId), {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: label || "",
                data: values,
                backgroundColor: colors.slice(0, labels.length),
            }]
        },
        options: {
            plugins: { legend: { position: legendPosition } }
        }
    });
};
