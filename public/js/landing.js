fetch("http://localhost:3000/api/overall-investments")
  .then(res => res.json())
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) return;
    const labels = data.map(item => item.category);
    const values = data.map(item => parseFloat(item.total));
    window.makeDoughnut("overallDoughnut", labels, values, "Overall Investment Distribution");
});
