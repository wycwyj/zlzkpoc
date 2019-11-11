<%@page pageEncoding="UTF-8" contentType="text/html;charset=UTF-8" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<script type="text/javascript" charset="UTF-8" src="<%=request.getContextPath()%>/wood/resource/webjars/echarts/echarts.js"></script>
	<title>日志空间监控</title>

</head>
<body style="overflow-y:auto;overflow-x:hidden;">
<div>
	<div id="main" style="width: 600px;height:400px;"></div>

</div>
<script type="text/javascript">
    var dblogSpace = ${logSpace};
    var logused = dblogSpace.used;
    var logfree = dblogSpace.free;
    var colorf = logfree/dblogSpace.total;
    var option;
    // 基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'));

    // 指定图表的配置项和数据
	if(colorf>=0.8){
        option = {
            title : {
                text: '日志空间监控',
                x:'center'
            },
            color:['#00AAD2','#FF4C4C'],
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['剩余空间','已用空间']
            },
            series : [
                {
                    name: '日志空间',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data:[
                        {value:logfree, name:'剩余空间'},
                        {value:logused, name:'已用空间'}
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

    }else{
        option = {
            title : {
                text: '日志空间监控',
                x:'center'
            },
            color:['#00AAD2','#FFC0CB'],
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['剩余空间','已用空间']
            },
            series : [
                {
                    name: '日志空间',
                    type: 'pie',
                    radius : '55%',
                    center: ['50%', '60%'],
                    data:[
                        {value:logfree, name:'剩余空间'},
                        {value:logused, name:'已用空间'}
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
    }

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
</script>
</body>
</html>