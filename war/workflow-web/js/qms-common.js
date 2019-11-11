	/**
	 * 通用脚本文件
	 **/
	
	/**
	 * 获取系统时间
	 */
	function getSystemTime(){
		var mytime = new Date();
        var iYear = mytime.getFullYear();
        var month = mytime.getMonth()+1;
        var day= mytime.getDate();
        var hour = mytime.getHours();
        var min = mytime.getMinutes();
        var s = mytime.getSeconds();
        var weekend = mytime.getDay();
        var weeks = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
        var week = weeks[weekend];
        var str;
        
        function formats(tem){
            if(tem<10){
                return "0"+tem;
            }else{
                return tem;
            }
        };
        str = iYear+"年"+month+"月"+day+"日&nbsp;["+week+"] "+formats(hour)+":"+formats(min)+":"+formats(s);
        return str;
	}
	
	