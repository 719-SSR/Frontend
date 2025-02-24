$(document).ready(function() {

  // 创建折线图 (水温)
  var ctxLine = document.getElementById('lineChart').getContext('2d');
  var lineChart = new Chart(ctxLine, {
    type: 'line',  // 图表类型
    data: {
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      datasets: [{
        label: '水温 (°C)',
        data: [22, 24, 23, 25, 26, 27, 28],  // 水温数据
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

  // 创建饼状图
  var ctxPie = document.getElementById('pieChart').getContext('2d');
  var pieChart = new Chart(ctxPie, {
    type: 'pie',  // 图表类型
    data: {
      labels: ['类别 A', '类别 B', '类别 C'],
      datasets: [{
        label: '随机数据',
        data: [10, 20, 30],  // 随便的比例数据
        backgroundColor: ['#FF5733', '#33FF57', '#3357FF'],
        hoverOffset: 10  // 悬停时凸起的效果
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              return tooltipItem.label + ': ' + tooltipItem.raw + '%';  // 显示百分比
            }
          }
        }
      }
    }
  });

});
