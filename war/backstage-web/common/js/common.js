/*
* common plugins 
* create by guoshun.hou
*/
(function($){
	/*nav toggle，一二级导航dd*/
	$.fn.navs = function(options1,options2){ 
		var defaults1 = {ctag: 'li',curCss: 'current',overCss:'hover',click:null},
			defaults2 = {subnav: '#subnav',ptag:'ul',ctag:'li',curCss:'current',overCss:'hover',click:null},
			opts1 = $.extend(defaults1, options1),
			opts2 = $.extend(defaults2, options2);
		
		return this.each(function() {
			var o = $.meta ? $.extend(opts1, $this.data()) : opts1;
			var oo = $.meta ? $.extend(opts2, $this.data()) : opts2;
			var $this = $(this),
				nodes = $this.find(o.ctag),
				subnav = $(oo.subnav),
				subNavs = subnav.find(oo.ptag);
			//一级
			nodes.each(function(i,e){
				$(e).hover(function(){
					$(this).toggleClass(o.overCss);
				}).bind("click",{index:i},function(event){
					nodes.removeClass(o.curCss);
					$(this).addClass(o.curCss);
					var subCNodes = subNavs.hide().eq(i).find(oo.ctag);
					if(subCNodes.size()>0){
						subNavs.eq(i).show();
						subCNodes.removeClass(oo.curCss).eq(0).addClass(oo.curCss);
					}else{
						subNavs.eq(i).hide()
					}
					if(subNavs.eq(0).find(oo.ctag).size()>0) subNavs.eq(0).show();
					if(o.click) o.click(event.data.index);
				});
			});
			//二级
			subNavs.each(function(){
				var subCNodes = $(this).find(oo.ctag);
				subCNodes.each(function(i,e){
				    $(e).hover(function() {
      $(this).toggleClass(o.overCss);
  }).bind('click', {index:i},function(event) {
      subCNodes.removeClass(oo.curCss);
      $(this).addClass(oo.curCss);
      if(oo.click) oo.click(event.data.index);
  });
				});
			});			
		});
	};
/*menu slider，菜单目前只支持到二级*/
$.fn.menus = function(options){
	var defaults = {headTag:'.menuhead',conTag:'.menucon',height:0,curCss:'current',overCss:'hover',openFirst:true,click:null};
   opts = $.extend(true, defaults, options);
	return this.each(function(){
   var $this = $(this),
       o = $.meta ? $.extend(opts, $this.data()) : opts;
   $this.children(o.headTag).each(function(){
       $(this).unbind("click").bind("click",function(){
  if($(this).hasClass(o.curCss)) return;
  sildeLi($(this),$(this).next(o.conTag),o);
  if(o.click) o.click($(this));
       }).unbind("hover").bind("hover",function(){
  $(this).toggleClass(o.overCss);
       }); 
       if(o.height==0)
  $(this).next(o.conTag).hide();
       else
  $(this).next(o.conTag).height(0);
   });
   if(o.openFirst){
       var first = $this.children(o.headTag).first();
       sildeLi(first,first.next(o.conTag),o,true); 
   }
        });
        function sildeLi(head,con,o,notSlider){
   if(notSlider){
       if(con.height()>0){
  con.height(0);
       }else{
  con.height(o.height);
       }
       return; 
   }
   if(o.height==0){
       if(con.css("display")=="none"){
  head.addClass(o.curCss);
  con.slideDown("fast");
       }else{
  head.removeClass(o.curCss);
  con.slideUp("fast");
       }
   }else{
       if(con.height()>0){
  con.animate({"height":0}, {complete:function(){head.removeClass(o.curCss);con.css("overflow","hidden")}});
       }else{
  head.addClass(o.curCss);
  con.animate({"height":o.height}, {complete:function(){con.css("overflow","auto")}});
       }
   }
        }
    };
	
    /*弹出框*/
    $.fn.winOpen=function(){
        var methods = {//扩展方法
   init: function(options) {
       return this.each(function() {
  var $this = $(this);
  var settings = $this.data('winOpen');
  if(typeof(settings) == 'undefined') {
      var defaults = {
      		modal:true,
      		name:"winopen",
      		title:"",
      		url:"",
      		width:500,
      		height:500,
      		left:'50%',
      		top:'50%',
      		center:1,
      		help:0,
      		resizable:0,
      		status:0,
      		scroll:0,
      		event:null,
      		onClick:null,
      		beforeOpen:null,
      		afterOpen:null,
      		Close:null,
      		postData:{},
      		returnData:{}
      	};
      settings = $.extend(true, defaults, options);
      $this.data('winOpen', settings);
  } else {
      settings = $.extend(true, settings, options);
      $this.data('winOpen', settings);
  }
  var o = settings;
      o.width = o.width<1 ? o.width*$(window).width():o.width;
      o.height = o.height<1 ? o.height*$(window).height():o.height;
      if(o.center==1){
      	o.top = (window.screen.availHeight-o.height)*0.5;
      	o.left = (window.screen.availWidth-o.width)*0.5;
      }
  $this.delay = false;
  if(o.event){
	  $this.on(o.event,function(){
	  	if(!$this.delay){
		  	if(o.beforeOpen) if(!o.beforeOpen()) return;
		  	try{
			  	var wintop = window.top ||window;
			  	var mask = wintop.$("#winmask");
			      if(mask.size()==0)
			      	wintop.$("body").append("<div class='winmask' id='winmask'></div>");
			      else
			      	mask.show()
		      }catch(e){}
//		      var cback = arguments.callee;
//		      setTimeout(function(){
//		      	$this.delay = true;
//		      	cback();
//		      },100);
//		      return;
	     }
	  	var returnValue = window.showModalDialog(
	  			o.url,
	  			o.postData,
	  			"dialogWidth="+o.width+"px"+
	  			";dialogHeight="+o.height+"px"+
	  			";dialogLeft="+o.left+
	  			";dialogTop="+o.top+
	  			";center="+o.center+
	  			";help="+o.help+
	  			";resizable="+o.resizable+
	  			";status="+o.status+
	  			";scroll="+o.scroll+ 
									";target='_self'" 
	  			
	  	);
	      try{
	      	var wintop = window.top ||window;
			  wintop.$("#winmask").hide();
			       }catch(e){}
	  	$this.data('returnValue', returnValue);
	  	if(o.Close) o.Close($this);
	  });
  }else{
  	if(!$this.delay){
	  	if(o.beforeOpen) if(!o.beforeOpen()) return;
	  	try{
		  	var wintop = window.top ||window;
		  	var mask = wintop.$("#winmask");
		      if(mask.size()==0)
		      	wintop.$("body").append("<div class='winmask' id='winmask'></div>");
		      else
		      	mask.show()
	      }catch(e){}
//	      var cback = arguments.callee;
//	      setTimeout(function(){
//	      	$this.delay = true;
//	      	cback();
//	      },100);
//	      return;
	  }
  	var returnValue = window.showModalDialog(
	  			o.url,
	  			o.postData,
	  			"dialogWidth="+o.width+"px"+
	  			";dialogHeight="+o.height+"px"+
	  			";dialogLeft="+o.left+
	  			";dialogTop="+o.top+
	  			";center="+o.center+
	  			";help="+o.help+
	  			";resizable="+o.resizable+
	  			";status="+o.status+
	  			";scroll="+o.scroll+ 
									";target='_self'" 
	  			
	  	);
      try{
      	var wintop = window.top ||window;
		  wintop.$("#winmask").hide();
		       }catch(e){}
  	$this.data('returnValue', returnValue);
  	if(o.Close) o.Close();
  }
       }); 
   },
   destroy: function(options) {
       return $(this).each(function() {
  var $this = $(this);
  $this.removeData('winOpen');
       });
   },
   val: function(options) {
       var someValue = this.eq(0).html();
       return someValue;
   }
        };
        //添加或修改url传参
        function _setParams(param,value,url){
   var reg = new RegExp('([\?&]?)' + param + '=[^&]*[&$]?', 'gi'),
       index = url.indexOf('?'),
       urlParam = "" ;
   if(index > -1){
       urlParam = url.slice(index),
       url = url.slice(0,index),
       urlParam = urlParam.replace(param,'$1');
   }
   
   if (urlParam == '') {
       urlParam += param + '=' + value;
   } else if (urlParam.substr(urlParam.length - 1,1) == '?' || urlParam.substr(urlArgs.length - 1,1) == '&') {
       urlParam += param + '=' + value;
   } else {
       urlParam += '&' + param + '=' + value;
   }
   if(!(/^\?.*?/gi).test(urlParam))
       urlParam = "?"+urlParam;
   return (url + urlParam);
        }
        //function _
        //添加方法
        var method = arguments[0];
        if(methods[method]) {
   method = methods[method];
   arguments = Array.prototype.slice.call(arguments, 1);
        } else if( typeof(method) == 'object' || !method ) {
   method = methods.init;
        } else {
   $.error( 'Method ' +  method + ' does not exist on jQuery.winOpen' );
   return this;
        }
        return method.apply(this, arguments);
    };
    /*
	*wresize
	*/
	$.fn.wresize = function(f){
		function handleWResize(e){
			if(f){
				if(f.tid)clearTimeout(f.tid);
				f.tid=setTimeout(function(){
					f.call([e]);
				},100)
			}
		}
		this.each(function(){
			if (this == window){
				$(this).resize(handleWResize);
			}else{
				$(this).resize(f);
			}
		});
		return this;
	};
	/*datagrid.methods*/
	if($.fn.datagrid){
    	$.extend($.fn.datagrid.methods, {
    		editCell: function(jq,param){
    			return jq.each(function(){
    				var opts = $(this).datagrid('options');
    				var fields = $(this).datagrid('getColumnFields',true).concat($(this).datagrid('getColumnFields'));
    				for(var i=0; i<fields.length; i++){
    					var col = $(this).datagrid('getColumnOption', fields[i]);
    					col.editor1 = col.editor;
    					if (fields[i] != param.field){
    						col.editor = null;
    					}
    				}
    				$(this).datagrid('beginEdit', param.index);
    				for(var i=0; i<fields.length; i++){
    					var col = $(this).datagrid('getColumnOption', fields[i]);
    					col.editor = col.editor1;
    				}
    				$(".datagrid-editable-input").focus();
    			});
    		},
			// 激活某字段表格列的编辑状态
			// create by guoshun.hou 20130926
			activateColumnEditor:function(jq,columnsNames){
				jq.each(function(){
					var fields = $(this).datagrid('getColumnFields',true).concat($(this).datagrid('getColumnFields'));
					for(var i=0; i<fields.length; i++){
						var col = $(this).datagrid('getColumnOption', fields[i]);
						col.editor1 = col.editor;
						if (columnsNames.indexOf(fields[i])<0){
							col.editor = null;
						}
					}
					for(var i=0; i<$(this).datagrid('getRows').length; i++){
						$(this).datagrid('beginEdit', i);
					}
					for(var i=0; i<fields.length; i++){
						var col = $(this).datagrid('getColumnOption', fields[i]);
						col.editor = col.editor1;
					}
				});
			},
			// 合并指定列内容相同的单元格
			// create by guoshun.hou 20130922
			mergeCellsByField: function(jq, colList){
				var ColArray = colList.split(',');
				var TableRowCnts = jq.datagrid('getRows').length;
				var tmpA;
				var tmpB;
				var PerTxt = '';
				var CurTxt = '';
				var alertStr = '';
				for(j=ColArray.length-1;j>=0;j--){
					PerTxt = "";
					tmpA = 1;
					tmpB = 0;
					for(i=0;i<=TableRowCnts;i++){
						if(i==TableRowCnts)
							CurTxt = '';
						else
							CurTxt = jq.datagrid('getRows')[i][ColArray[j]];
						if(PerTxt==CurTxt)
							tmpA += 1;
						else{
							tmpB += tmpA;
							jq.datagrid('mergeCells',{
								index: i-tmpA,
								field: ColArray[j],
								rowspan: tmpA,
								colspan: null
							});
							tmpA = 1;
						}
						PerTxt = CurTxt;
					}
				}
				jq.datagrid("selectComplexRow");
			},
			// 复杂表格整行背景色
			// create by guoshun.hou 20130930
			selectComplexRow:function(jq){
				var rowspan = 1;
				var table =  jq.datagrid('getPanel').find('.datagrid-body table');
				table.each(function(){
					$(this).find('tr').each(function(i){
						$(this).find('td').each(function(){
							this.beginRowIndex = i + 1;
							rowspan = $(this).attr('rowspan');
							this.endRowIndex = i + (rowspan?parseInt(rowspan):1);
							$(this).mouseover(function(){
								var _this = this;
								table.find('td').each(function(){
									//sender为单行
									if(_this.beginRowIndex == _this.endRowIndex){
										if(_this.beginRowIndex >= this.beginRowIndex && _this.endRowIndex <= this.endRowIndex){$(this).addClass('td-over');}
									}else{
										//target为单行
										if(this.beginRowIndex == this.endRowIndex){
											if(_this.beginRowIndex <= this.beginRowIndex && _this.endRowIndex >= this.endRowIndex){$(this).addClass('td-over');}
										}else{
											if((this.beginRowIndex <= _this.beginRowIndex && this.endRowIndex >= _this.endRowIndex) || (_this.beginRowIndex <= this.beginRowIndex && _this.endRowIndex >= this.endRowIndex)){$(this).addClass('td-over');}
										}
									}
								});
							}).mouseout(function(){table.find('td').removeClass('td-over');});
						});
					});
				});
			}
    	});
    	$.extend($.fn.datagrid.defaults.editors, {  
    	    select: {  
    	        init: function(container, options){
    	        	var data = options.data,len=data.length,html="",onchange = options.onChange;
    	        	while(len--){
    	        		html += "<option value="+data[len].value+">"+data[len].text+"</option>";
    	        	}
    	   var select = $('<select>'+html+'</select>').appendTo(container).on("change",function(){if(typeof onchange == "function") onchange(this);});
    	   return select;
    	        },
    	        getValue: function(target){  
    	   return $(target).val();
    	        },
    	        setValue: function(target, value){  
    	   $(target).val(value);
    	        },
    	        resize: function(target, width){  
    	   var select = $(target);  
    	   if ($.boxModel == true){  
    	   	select.width(width - (select.outerWidth() - select.width())-10);  
    	   } else {  
    	   	select.width(width-10);
    	   }  
    	        }  
    	    }  
    	});
   };
})(jQuery);

//格式化json模板
function formatJson(str,args){
	if(!str) return str='';
	for(var i in args){
		var reg= new RegExp('\{('+i+')\}',"g");
		str = str.replace(reg,args[i]);
	}
	return str;
}
//debugging    
function debug(info) {
	if (window.console && window.console.log)    
	window.console.log('out: ' + info);
};
//双击不选中
var clearSelection = function () {
    if(document.selection && document.selection.empty) {
        document.selection.empty();
    }
    else if(window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
	}
};

(function($){
    //按钮效果
    $("button.button").hover(function(){$(this).toggleClass("bhover")}).mousedown(function(){$(this).addClass("bclick");}).mouseup(function(){$(this).removeClass("bclick")});
    $("button.sbutton").hover(function(){$(this).toggleClass("shover")}).mousedown(function(){$(this).addClass("sclick");}).mouseup(function(){$(this).removeClass("sclick")});
    $("button.bbutton").hover(function(){$(this).toggleClass("bbhover")}).mousedown(function(){$(this).addClass("bbclick");}).mouseup(function(){$(this).removeClass("bbclick")});
	$("button.selbutton1").hover(function(){$(this).toggleClass("selhover1")}).mousedown(function(){$(this).addClass("selclick1");}).mouseup(function(){$(this).removeClass("selclick1")});
	$("button.selbutton2").hover(function(){$(this).toggleClass("selhover2")}).mousedown(function(){$(this).addClass("selclick2");}).mouseup(function(){$(this).removeClass("selclick2")});
	$("button.selbutton3").hover(function(){$(this).toggleClass("selhover3")}).mousedown(function(){$(this).addClass("selclick3");}).mouseup(function(){$(this).removeClass("selclick3")});
	$("button.selbutton4").hover(function(){$(this).toggleClass("selhover4")}).mousedown(function(){$(this).addClass("selclick4");}).mouseup(function(){$(this).removeClass("selclick4")});
	$(".sch-item input.txt").click(function(){$(this).val("").addClass("on");}).blur(function(){if(this.value=="")$(this).val("输入学生姓名或学生编号").removeClass("on");});
	$(".extend-button").on("click",function(){$(this).toggleClass('extend-button-collapse');});
	$(".extend-sch-button").unbind().on("click",function(){$(this).text($(this).text()=="显示搜索栏"?"隐藏搜索栏":"显示搜索栏");$(this).toggleClass('extend-button-collapse');});
})(jQuery);


//日期比较、日期不能晚于今天
(function($){
	$.fn.tdDate = function(options){ 
		var defaults = {obj:'div.calendar-body',children: 'td',className:'calendar-other-month',click:null},
			opts = $.extend(defaults, options);
		return this.each(function() {
			var o = $.meta ? $.extend(opts1, $this.data()) : opts;
			var $this = $(this);
				$children = $this.find(o.children);
				$children.each(function(){
					var tdDate=$(this).attr("abbr");
					var tdArray=tdDate.split(',');
					tdArray[1]=formatorDate(tdArray[1]);
					tdArray[2]=formatorDate(tdArray[2]);
					tdDate=tdArray[0]+"-"+tdArray[1]+"-"+tdArray[2];
					var d1=curDate();
					var d2=tdDate;
					var bool=dateCompare2(d1,d2);
					if(bool)
					{
						$(this).addClass("calendar-other-month");
					}
				});
						
		});
	}
})(jQuery);
function curDate(){
	var today = new Date();
	var y = today.getFullYear();
	var m = today.getMonth()+1;
	var d = today.getDate();
	var tdDate=null;
	m=formatorDate(m);
	d=formatorDate(d);
	var d1=y+"-"+m+"-"+d;
	return d1;
}
function dateCompare(d2){
	var d1=curDate();
	dateCompare1(d1,d2);   
}
function dateCompare1(d1,d2){
	var reg=new RegExp("-","g"); //创建正则RegExp对象  
	var tempBeginTime=d1.replace(reg,"\/");      
	var tempEndTime=d2.replace(reg,"\/");       
	//比较时间大小，开始时间一定要小于结束时间       
	if(Date.parse(new Date(tempBeginTime))>Date.parse(new Date(tempEndTime))){
		alert("开始时间不能晚于结束时间");
		$('#js_planstart').datebox("setValue",d1);
		return;
	} 
}
function dateCompare2(d1,d2){
	var reg=new RegExp("-","g"); //创建正则RegExp对象  
	var tempBeginTime=d1.replace(reg,"\/");      
	var tempEndTime=d2.replace(reg,"\/");       
	//比较时间大小，开始时间一定要小于结束时间       
	if(Date.parse(new Date(tempBeginTime))>Date.parse(new Date(tempEndTime))){
		return true;
	} 
	else{
	 return false;
	}
}
 //格式化月和日
 function formatorDate(time){
	if(time.toString().length == 1)
	{
		time="0"+time;
		return time;
	}
	else{
		return time;
		}
 }
Date.prototype.pattern=function(fmt) {
	var o = {
		'M+' : this.getMonth()+1, //月份
		'd+' : this.getDate(), //日
		'h+' : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
		'H+' : this.getHours(), //小时
		'm+' : this.getMinutes(), //分
		's+' : this.getSeconds(), //秒
		'q+' : Math.floor((this.getMonth()+3)/3), //季度
		'S' : this.getMilliseconds() //毫秒
	};
	var week = {
		'0' : '日',
		'1' : '一',
		'2' : '二',
		'3' : '三',
		'4' : '四',
		'5' : '五',
		'6' : '六'	
    };
    if(/(y+)/.test(fmt)){
	fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
	fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length>2 ? '星期' : '周') : '') + week[this.getDay()+'']);
    }
    for(var k in o){
	if(new RegExp('(' + k + ')').test(fmt)){
   			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00'+ o[k]).substr(('' + o[k]).length)));
	}
    }
    return fmt;
}
//textarea自动增高
function addEvent(){
	var obj_textarea = document.getElementsByTagName("textarea");
	if(obj_textarea[0]=="undefined"||obj_textarea[0]==null) return;
	for(var i=0;i<3;i++){
		if(obj_textarea[i])
		{
			if (window.addEventListener) {//Mozilla系列
				obj_textarea[i].addEventListener('input', TextAreaH_NOIE, false);
			} else if (window.attachEvent) {//IE
				obj_textarea[i].attachEvent('onpropertychange',function (){
					TextAreaH_NOIE.call(event.srcElement);
				});
			}
		}
	}
	function TextAreaH_NOIE(){
		if((this.scrollHeight-this.clientHeight)>0)this.style.height=this.scrollHeight + 'px';
	}
}
//create by guoshun.hou on 20130917
//目录树节点：上（-1）下（1）移
function move(sender, path, fn){
	var tr = $(sender).parents('.datagrid-row');
	var trSub = tr.next('tr.treegrid-tr-tree');
	if(path==1){
		var sib = tr.nextAll('tr:not(.treegrid-tr-tree):first');
		var sibSub = sib.next('tr.treegrid-tr-tree');
		if(sib[0]){
			if(sibSub[0]){
				tr.insertAfter(sibSub);
			}else{
				tr.insertAfter(sib);
			}
			trSub.insertAfter(tr);
			if(fn)fn.call(tr,sib);
		}else{
			alert('已到最下位置');	
		}
	}else{
		var sib = tr.prevAll('tr:not(.treegrid-tr-tree):first');
		var sibSub = sib.next('tr.treegrid-tr-tree');
		if(sib[0]){
			tr.insertBefore(sib);
			trSub.insertAfter(tr);
			if(fn)fn.call(tr,sib);
		}else{
			alert('已到最上位置');	
		}
	}
}

//textarea align
function textareAlign(parent){
	var winWidth = $(window).width(),winHeight=$(window).height();
	$("textarea.equalW").width(winWidth*0.5+224);
	var hScroll,hh,wScroll,ww;
	hScroll=document.getElementById(parent).scrollHeight;
	hh=document.getElementById(parent).clientHeight;
	wScroll=document.getElementById(parent).scrollWidth;
	ww=document.getElementById(parent).clientWidth;
	if ((hScroll-hh<=0)&&(wScroll-ww<=0))	//no vertical and no line
	{	//alert("both no");
		$("textarea.equalW").width(winWidth*0.5+224);
	}
	else if ((hScroll-hh>0)&&(wScroll-ww>0)) //vertical and line
	{	//alert("both");
		$("textarea.equalW").width(586);
		if(navigator.userAgent.indexOf("MSIE 6.0")>0||navigator.userAgent.indexOf("MSIE 7.0")>0){
			$("textarea.equalW").width(winWidth*0.5+224);
			$("#"+parent).addClass("hidden-x").addClass("hidden-y");
			if((hScroll-hh<18)&&(wScroll-ww<18))
			{	//alert("both ie no");
				$("textarea.equalW").width(winWidth*0.5+244);
				$("#"+parent).addClass("hidden-x").addClass("hidden-y");
			}
			else if((hScroll-hh<18)&&(wScroll-ww>=18)){
				//alert("ie l");
				$("textarea.equalW").width(604);
				$("#"+parent).addClass("hidden-y").removeClass("hidden-x");
			}
			else if((hScroll-hh>=18)&&(wScroll-ww<18)){
				//alert("ie v");
				$("textarea.equalW").width(winWidth*0.5+224);
				$("#"+parent).addClass("hidden-x").removeClass("hidden-y");
			}
			else if((hScroll-hh>=18)&&(wScroll-ww>=18)){
				//alert("ie both");
				$("textarea.equalW").width(604);
				$("#"+parent).removeClass("hidden-x").removeClass("hidden-y");
			}
		}
	}
	else if((hScroll-hh>0)&&(wScroll-ww<=0))  //vertical
	{	//alert("v");
		$("textarea.equalW").width(winWidth*0.5+216);
	}
	else if((hScroll-hh<=0)&&(wScroll-ww>0)){ //line
		//alert("l");
		$("textarea.equalW").width(586);
	}	
}

function divResize(obj, json, fn) {
	clearInterval(obj.iTimer);
	var iCur = 0;
	var iSpeed = 0;
		
	obj.iTimer = setInterval(function() {
		
		var iBtn = true;
					
		for ( var attr in json ) {
							
			var iTarget = json[attr];
			
			if (attr == 'opacity') {
				iCur = Math.round(css( obj, 'opacity' ) * 100);
			} else {
				iCur = parseInt(css(obj, attr));
			}
			
			iSpeed = ( iTarget - iCur ) / 8;
			iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
			
			if (iCur != iTarget) {
				iBtn = false;
				if (attr == 'opacity') {
					obj.style.opacity = (iCur + iSpeed) / 100;
					obj.style.filter = 'alpha(opacity='+ (iCur + iSpeed) +')';
				} else {
					obj.style[attr] = iCur + iSpeed + 'px';
				}
			}
			
		}
		
		if (iBtn) {
			clearInterval(obj.iTimer);
			fn && fn.call(obj);
		}
		
	}, 30);
}
// 是图文轮播效果控
// creat by guoshun.hou 20131009
(function(jQuery){
	jQuery.fn.th_focus_swing = function(options){
		var defaults = {
			time		:3000,		//轮换秒数
            index		:1,			//默认第几张		
			speed		:500,		//切换时间
			dis			:1000,
			splits 		:1,			//总标签
			orient		:1
		};
		var opts = jQuery.extend(defaults, options);
		
		var _index = opts.index;
		var _time = opts.time;
		var _speed = opts.speed;
		var _dis = opts.dis;
		var _splits = opts.splits;
		var _orient = opts.orient;
		
		var _this = jQuery(this);
		
		var node_ul = _this.find(".contentimg");	
		var node_li = node_ul.find("li");
		var node_li_desc = jQuery(".contentdesc").find("li");
		var node_li_nav = jQuery(".navbtns").find("li");
		
		var li_len = node_li.length;
		
		var _countIndex = (node_li.length/opts.split -  1)    
		var _start_left = node_ul.css("left");                
 		
		var _timer = setInterval(show, _time);

        init();
		//alert(1);
		function init() {
			node_ul.mouseover(function() {
				_timer = clearInterval(_timer);
			}).mouseout(function() {
				_timer = setInterval(show, _time);
			});
			node_li_desc.mouseover(function() {
				_timer = clearInterval(_timer);
			}).mouseout(function() {
				_timer = setInterval(show, _time);
			});
			
			node_li_nav.mouseover(function() {
				 node_ul.stop(true, true);
				 node_li_desc.stop(true, true);
				 node_li_desc.eq(_index-1).css("display", "none");
				 node_li_nav.eq(_index-1).removeClass("selected");
				 _index = parseInt(jQuery(this).attr("_index"));
				 node_li_desc.eq(_index-1).fadeIn(_speed);
				 node_li_nav.eq(_index-1).addClass("selected");
				 _left = -_dis*(_index - 1); 
				 node_ul.animate({"left": _left}, _speed);
				_timer = clearInterval(_timer);
			}).mouseout(function() {
				_timer = setInterval(show, _time);
			});
		}
		
		function show() {
                        //alert(2);
			node_ul.stop(true, true);
			if(_orient>0){
				node_li_nav.eq(_index-_orient).removeClass("selected");
				node_li_desc.eq(_index-_orient).css("display", "none");
			}else{
				node_li_nav.eq(_index-_orient).removeClass("selected");
				node_li_desc.eq(_index-_orient).css("display", "none");
			}
			_index = _index + _orient;
			if(_orient>0){
				if(_index > li_len) {
					node_ul.append(node_ul.find("li:lt(1)"));
					node_ul.css("left", parseInt(node_ul.css("left")) + _dis);
					node_li_nav.eq(0).addClass("selected");
					node_li_desc.eq(0).fadeIn(_speed);
				}
				else {
					node_li_nav.eq(_index-_orient).addClass("selected");
					node_li_desc.eq(_index-_orient).fadeIn(_speed);
				}
			}else{
				if(_index <= 0) {
					node_ul.prepend(node_ul.find("li:gt("+(li_len-_splits-1)+")"));
					node_ul.css("left", parseInt(node_ul.css("left")) - _dis);
					node_li_nav.eq(li_len-_splits).addClass("selected");
					node_li_desc.eq(li_len-_splits).fadeIn(_speed);
				}
				else {
					node_li_nav.eq(_index-_orient).addClass("selected");
					node_li_desc.eq(_index-_orient).fadeIn(_speed);
				}
			}
			var _left = parseInt(node_ul.css("left")) - _dis * _orient;
			node_ul.animate({"left": _left}, _speed, function() {
				if(_orient>0){
					if(_index > li_len) {
						node_ul.prepend(node_ul.find("li:gt("+(li_len-_splits-1)+")"));
						node_ul.css("left", 0);
						_index = 1;
					}
				}else{
					if(_index <= 0) {
						node_ul.append(node_ul.find("li:lt(0)"));
						node_ul.css("left", -(li_len_splits-1)*_dis);
						_index = li_len-1;
					}
				}
					
			});
			
		}
	}
})(jQuery);






