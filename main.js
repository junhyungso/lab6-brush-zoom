import AreaChart from './AreaChart.js';
import StackedAreaChart from './StackedAreaChart.js';

d3.csv('unemployment.csv', d3.autoType).then(data => {
    console.log(data)
    data.map(d=>d.total=sum(d));

    function sum(d){
        let sum = 0;
        for (let elem in d){
            if(elem !== 'date'){
                sum += d[elem]
            }
        }
        return sum;
    }

    const stackedAreaChart = StackedAreaChart('.stackchart')
    stackedAreaChart.update(data);

    const areaChart = AreaChart('.areachart');
    areaChart.update(data);
    areaChart.on("brushed", (range)=>{
        stackedAreaChart.filterByDate(range); // coordinating with stackedAreaChart
    })    
})


