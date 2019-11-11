/*
 * jQuery pera datagrid 1.0.0
 * create by guoshun.hou 20140317
 */
(function($) {
	var tableDomCount = 0;
    var _datagridMethods = {
		_init: function(options){
			return this.each(function(){
				this.style.display = 'none';
				var _this = this;
				var opts = $.extend(true, {}, $.fn.datagrid.defaults, _this.options, options, $.parseOptionsToJOSN($(this).data('options')), $.parseAttributeToJOSN(_this.attributes));
				opts.rowIdPrefix = ++tableDomCount;
				opts.componentMode = opts.fit || (opts.height && /^\d+$/.test(opts.height));
				_this.sender = this;
				_this.options = opts;
				if(_this.tHead)_datagridMethods._getFields.call(_this);
				_this.fields = _datagridMethods._parseFields.call(_this);
				opts.showFooter = opts.showFooter || opts.showTotalRow;
				if(opts.componentMode){
					_this.headerFieldTd = {};
					_this.options.originWindowSize = {},
					_this.options.originWindowSize.width = $(document.body).width();
					_this.options.originWindowSize.height = $(document.body).height();
					_this.options.originParentSize = {},
					_this.options.originParentSize.width = $(_this.parentNode).width();
					_this.options.originParentSize.height = _datagridMethods._parseParentHeight.call(_this);
				}
				if(!_this.initialized){
					_this.owner = _this.parentNode.insertBefore(document.createElement("DIV"), _this);
					_this.owner.className = 'datagrid pera-datagrid' + (_this.className?(' ' + _this.className):'');
				}
				//make title
				var title = _this.title || opts.title
				if(title)_datagridMethods._makeTitle.call(_this, title);
				//make toolbar
				var toolbar = opts.toolbar;
				if(toolbar)_datagridMethods._makeToolbar.call(_this, toolbar);
				//make datagrid view
				if(!_this.initialized){
					_this.datagridView = _this.owner.appendChild(document.createElement("DIV"));
					_this.datagridView.className = 'datagrid-view';
					_this.tableBody = _this.datagridView.appendChild(document.createElement("DIV"));
					_this.tableBody.className = !opts.componentMode?'datagrid-table-wraper':'datagrid-body-view';
					if(!opts.componentMode){
						if(opts.showHeader)_this.tableHeader = _this.tableBody;
						if(opts.showFooter)_this.tableFooter = _this.tableBody;
					}else{
						if(opts.showHeader){
							_this.tableHeader = _this.datagridView.insertBefore(document.createElement("DIV"), _this.tableBody);
							_this.tableHeader.className = 'datagrid-header-view';
							_datagridMethods._makeTheader.call(_this);
						}
						if(opts.showFooter){
							_this.tableFooter = _this.datagridView.appendChild(document.createElement("DIV"));
							_this.tableFooter.className = 'datagrid-footer-view';
							_datagridMethods._makeTfooter.call(_this);
						}
						$(_this.tableBody).scroll(function(e){
							$(_this.tableFooter).scrollLeft($(_this.tableBody).scrollLeft());
							$(_this.tableHeader).scrollLeft($(_this.tableBody).scrollLeft());
						});
					}
				}
				//make pagination
				if(opts.pagePosition != 'both'){
					if(opts.pagePosition == 'bottom' && typeof _this.topPagination == 'object'){
						_this.topPagination.parentNode.removeChild(_this.topPagination);
						try{delete _this.topPagination;}catch(ex){_this.removeAttribute('topPagination');}
					}
					if(opts.pagePosition == 'top' && typeof _this.bottomPagination == 'object'){
						_this.bottomPagination.parentNode.removeChild(_this.bottomPagination);
						try{delete _this.bottomPagination;}catch(ex){_this.removeAttribute('bottomPagination');}
					}
				}
				if(typeof _this.topPagination != 'object' && opts.pagination && opts.pagePosition != 'bottom')_this.topPagination = _datagridMethods._makePagination.call(_this);
				if(typeof _this.bottomPagination != 'object' && opts.pagination && opts.pagePosition != 'top')_this.bottomPagination = _datagridMethods._makePagination.call(_this);
				if(opts.fit){
					var resizer = function(){
						if(_this.initialized&&_this.options.originParentSize.height == _datagridMethods._parseParentHeight.call(_this))return;
						_datagridMethods._resize.call(_this, {height:_this.options.originParentSize.height + ($(document.body).height() - _this.options.originWindowSize.height)});
					};
					resizer();
					$(window).resize(function(){
						if(_this.tid)clearTimeout(_this.tid);
						_this.tid = setTimeout(resizer,10);
					});
				}
				//make table
				if(_this.tBodies.length > 0)_datagridMethods._parseData.call(_this);
				if(opts.url){
					_datagridMethods._request.call(_this, {}, !_this.initialized);
				}else{
					if(!opts.componentMode)
						_datagridMethods._makeTable.call(_this, opts.loadFilter.call(_this, opts.data));
					else
						_datagridMethods._makeTbody.call(_this, opts.loadFilter.call(_this, opts.data));
				}
			});
		},
		_parseParentHeight: function(){
			var style;
			if(document.defaultView){
				style = document.defaultView.getComputedStyle(this.parentNode, null);
				if(!parseInt(this.parentNode.style.height) && !parseInt(style.height)){
					return $(this.parentNode.parentNode).height() - parseInt(style.paddingTop) - parseInt(style.paddingBottom) - parseInt(style.borderTopWidth) - parseInt(style.borderBottomWidth) - parseInt(style.marginTop) - parseInt(style.marginBottom);
				}
			}else{
				style = this.parentNode.currentStyle;
				if(style.height == 'auto'){
					return $(this.parentNode.parentNode).height() - parseInt(style.paddingTop) - parseInt(style.paddingBottom) - parseInt(style.borderTopWidth.replace('px', '').replace(/[a-z]/, '0')) - parseInt(style.borderBottomWidth.replace('px', '').replace(/[a-z]/, '0')) - parseInt(style.marginTop) - parseInt(style.marginBottom);
				}
			}
			return $(this.parentNode).height();
		},
		_makeTitle: function(title){
			var opts = this.options;
			if(typeof this.toolbar != 'object'){
				this.titlePanel = this.owner.appendChild(document.createElement("DIV"));
				this.titlePanel.className = 'panel-header';
			}
			if(typeof this.toolbar != 'object'){
				this.titler = this.titlePanel.appendChild(document.createElement("DIV"));
				this.titler.className = 'panel-title';
			}
			this.titler.innerHTML = title;
		},
		_makeToolbar: function(toolbar){
			var opts = this.options;
			if(typeof toolbar == 'string'){
				if(this.toolbar&&this.toolbar.id==toolbar.substring(1))return;
				toolbar = document.getElementById(toolbar.substring(1));
				if(!toolbar)return;
				if(typeof this.toolbar == 'object')this.toolbar.parentNode.removeChild(this.toolbar);
				this.toolbar = this.owner.appendChild(toolbar);
			}else{
				if(typeof this.toolbar == 'object'){
					for(var i=this.toolbar.childNodes.length-1; i>=0; i--)this.toolbar.removeChild(this.toolbar.childNodes[i]);
				}else{
					this.toolbar = this.owner.appendChild(document.createElement("DIV"));
				}
				for(var i=0; i<toolbar.length; i++){
					if(toolbar[i] == '-'){
						$('<span class="datagrid-btn-separator" />').appendTo(this.toolbar);
					}else{
						$('<a id="datagrid' + opts.rowIdPrefix + 'toolbutton' + i + '" data-options="plain:true,iconCls:\''+ toolbar[i].iconCls + '\'" class="easyui-linkbutton l-btn l-btn-plain" href="javascript:void(0)"><span class="l-btn-left"><span class="l-btn-text '+ toolbar[i].iconCls + ' l-btn-icon-left">&nbsp;</span></span></a>').bind('click', toolbar[i].handler).appendTo(this.toolbar);
					}
				}
			}
			this.toolbar.owner = this;
			this.toolbar.className = 'datagrid-toolbar' + (this.toolbar.className?(' ' + this.toolbar.className):'');
		},
		_getFields: function(){
			var opts = this.options, cell, fieldOpts, value;
			opts.columns = [];
			for(var i=0; i<this.tHead.rows.length; i++){
				opts.columns.push([]);
				for(var j=0; j<this.tHead.rows[i].cells.length; j++){
					cell = this.tHead.rows[i].cells[j];
					fieldOpts = $.extend(true, {}, $.parseOptionsToJOSN($(cell).data('options')), $.parseAttributeToJOSN(cell.attributes));
					opts.columns[i].push({});
					opts.columns[i][j]['title'] = cell.innerHTML;
					for(var opt in fieldOpts){
						opts.columns[i][j][opt] = fieldOpts[opt];
					}
				}
			}
		},
		_parseFields: function(){
			var opts = this.options, fields = [], fieldOpts;
			for(var i=0; i<opts.columns.length; i++){
				for(var j=0; j<opts.columns[i].length; j++){
					fieldOpts = opts.columns[i][j];
					if(!fieldOpts.checkbox && (!fieldOpts.width || fieldOpts.width == 'auto') && !fieldOpts.hidden)this.hasFitColumn = true;
					fieldOpts.style = (fieldOpts.hidden?'display:none;':'') + (fieldOpts.align?('text-align:' + fieldOpts.align + ';'):'') + (fieldOpts.nowrap?('white-space:nowrap;'):'') + (!opts.fitColumns&&fieldOpts.width?('width:' + fieldOpts.width + 'px;'):'');
					if(opts.sortName == fieldOpts.field)fieldOpts.sortable = true;
					if(fieldOpts.checkbox){
						this.hasCheckColumn = true;
						fieldOpts.sortable = false;
					}
					if(fieldOpts.sortable)fieldOpts.order = 'asc';
					if(i==0){
						if(!fieldOpts.colspan || fieldOpts.colspan<=1){
							fields.push(fieldOpts);
							if(fieldOpts.total)opts.totalrow[fieldOpts.field] = 0;
						}else{
							for(var k=0; k<fieldOpts.colspan; k++){
								fields.push(null);
							}
						}
					}else{
						for(var k=0; k<fields.length; k++){
							if(!fields[k]){
								fields[k] = fieldOpts;
								break;
							}
						}
					}
				}
			}
			for(var i=0; i<fields.length; i++)fields[i].index = i + (opts.rownumbers?1:0);
			return fields;
		},
		_initTableDom: function(domName, data){
			var _this = this, opts = _this.options;
			if(domName != 'tfoot' && opts.showHeader){
				if(_this.hasCheckColumn && !opts.singleSelect)$('.datagrid-header-row .datagrid-cell-checkbox :checkbox', _this.tableHeader).prop('disabled', opts.total == 0).prop('checked', false);
				if(domName == 'table' || domName == 'thead'){
					$('.datagrid-header-row td', this.tableHeader).each(function(){
						if(opts.componentMode){
							_this.headerFieldTd[this.getAttribute('field')] = this;
						}
					}).unbind('.datagrid').bind('mouseover.datagrid', function(){
						if($(this).is('.datagrid-cell-extend')){
							$(this).prev().andSelf().addClass('datagrid-header-over');
						}else if($(this).is('.datagrid-cell-last')){
							$(this).next().andSelf().addClass('datagrid-header-over');
						}else{
							$(this).addClass('datagrid-header-over');
						}
					}).bind('mouseout.datagrid', function(){
						if($(this).is('.datagrid-cell-extend')){
							$(this).prev().andSelf().removeClass('datagrid-header-over');
						}else if($(this).is('.datagrid-cell-last')){
							$(this).next().andSelf().removeClass('datagrid-header-over');
						}else{
							$(this).removeClass('datagrid-header-over');
						}
					}).not('.datagrid-td-rownumber,.datagrid-cell-checkbox').bind('click.datagrid', function(){
						if($(this).is('.datagrid-cell-extend')){$(this).prev().triggerHandler('click.datagrid');return;}
						var fieldOpts = _datagridMethods._getColumnOption.call(_this, this.getAttribute('field'));
						if(fieldOpts.sortable){
							$(this).siblings('[field="' + opts.sortName + '"]').removeClass('datagrid-sort-asc datagrid-sort-desc');
							if(this.className.indexOf('datagrid-sort') > 0)fieldOpts.order = fieldOpts.order=='asc'?'desc':'asc';
							this.className = this.className.replace(' datagrid-sort-asc', '').replace(' datagrid-sort-desc', '') + ' datagrid-sort-' + fieldOpts.order;
							opts.sortName = fieldOpts.field;
							opts.sortOrder = fieldOpts.order;
							if(opts.total == opts.data.length){
								_datagridMethods._sortData.call(_this);
								_datagridMethods._loadData.call(_this, opts.data);
							}else{
								_datagridMethods._load.call(_this, {sort:opts.sortName, order:opts.sortOrder});
							}
						}
					});
					if(this.hasCheckColumn && !opts.singleSelect){
						$('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader).bind('click.datagrid', function(){
							_this.sender = this;
							if(this.checked)
								_datagridMethods._checkAll.call(_this);
							else
								_datagridMethods._uncheckAll.call(_this);
							$(this).bind('click.datagrid', function(e){e.stopPropagation();});
						});
					}
				}
			}
			if(domName == 'table' || domName == 'tbody'){
				$('.datagrid-body > tr.datagrid-row:not(.datagrid-row-empty)', _this.tableBody).each(function(i){
					_datagridMethods._initTr.call(_this, this, data[i]);
				});
			}
			if(domName == 'table' || domName == 'tfoot'){
				$('.datagrid-footer > tr', _this.tableFooter).each(function(i){
					if($(this).is('.datagrid-total-row'))this.data = opts.totalrow;
				});
			}
			//响应处理事
			if(domName == 'table' || domName == 'tbody' || domName == 're_tbody'){
				if(opts.onLoadSuccess)opts.onLoadSuccess.call(_this, {total:opts.total, rows:opts.data, attachData:opts.attachData});
				_datagridMethods._loaded.call(_this);
				_this.initialized = true;
				//自适应处理
				if(!opts.fit && ((opts.width && /^\d+$/.test(opts.width)) || (opts.height && /^\d+$/.test(opts.height)))){
					_datagridMethods._resize.call(_this, {width:opts.width?opts.width:'auto', height:opts.height?opts.height:'auto'});
				}else if(opts.fit){
					_datagridMethods._resize.call(_this, {scrollbar:true});
				}
			}
		},
		_makeTheader: function(){
			var opts = this.options, cHtml, tableStr = ['<div class="datagrid-header datagrid-header-inner"><table id="datagrid-table-header-' + opts.rowIdPrefix + '" class="datagrid-table">'];
			var fieldOpts = null, hStyle = '';
			tableStr.push('<thead class="datagrid-header">');
			for(var h1=0; h1<opts.columns.length; h1++){
				tableStr.push('<tr class="datagrid-header-row">');
				if(h1==0&&opts.rownumbers)tableStr.push('<td class="datagrid-cell datagrid-cell-first datagrid-td-rownumber"' + (opts.columns.length>1?(' rowspan="' + opts.columns.length + '"'):'') + '><span class="datagrid-header-rownumber">\u5e8f\u53f7</span></td>');
				for(var h2=0; h2<opts.columns[h1].length; h2++){
					fieldOpts = opts.columns[h1][h2];
					cHtml = fieldOpts.title;
					if(fieldOpts.sortable)cHtml += '<span class="datagrid-sort-icon">&nbsp;</span>';
					if(fieldOpts.checkbox)cHtml = opts.singleSelect?'&nbsp;':('<input type="checkbox" disabled="disabled" />');
					hStyle = (fieldOpts.hidden?'display:none;':'') + (fieldOpts.align&&!fieldOpts.halign?('text-align:' + fieldOpts.align + ';'):'') + (fieldOpts.halign?('text-align:' + fieldOpts.halign + ';'):'');
					tableStr.push('<td class="datagrid-cell');
					if(!opts.rownumbers&&h2==0)tableStr.push(' datagrid-cell-first');
					if((h1==0&&h2==opts.columns[h1].length-1)||(h1>0&&h2==this.fields.length-1))tableStr.push(' datagrid-cell-last');
					if(fieldOpts.checkbox)tableStr.push(' datagrid-cell-checkbox');
					if(fieldOpts.rowspan>1)tableStr.push('" rowspan="' + fieldOpts.rowspan);
					if(fieldOpts.colspan>1)tableStr.push('" colspan="' + fieldOpts.colspan);
					if(hStyle)tableStr.push('" style="' + hStyle);
					tableStr.push('" field="' + fieldOpts.field + '">');
					tableStr.push((fieldOpts.checkbox?'':'<div class="datagrid-cell-inner">') + (cHtml!=null?cHtml:'') + (fieldOpts.checkbox?'</td>':'</div></td>'));
				}
				if(h1==0)tableStr.push('<td class="datagrid-cell-extend" field="datagrid-cell-extend"' + (opts.columns.length>1?(' rowspan="' + opts.columns.length + '"'):'') + '></td>');
				tableStr.push('</tr>');
			}
			tableStr.push('</thead></table></div>');
			this.tableHeader.innerHTML = tableStr.join('');
			//初始化各部响应事件
			_datagridMethods._initTableDom.call(this, 'thead');
		},
		_makeTbody: function(data){
			var opts = this.options; 
			opts.total = data.total;
			opts.data = data.rows;
			opts.attachData = data.attachData;
			data = _datagridMethods._getRows.call(this);
			if(typeof this.topPagination == 'object')$(this.topPagination).pagination('refresh', {total: opts.total});
			if(typeof this.bottomPagination == 'object')$(this.bottomPagination).pagination('refresh', {total: opts.total});
			// table
			var tableStr = ['<table id="datagrid-table-' + opts.rowIdPrefix + '" class="datagrid-table' + (opts.fitColumns?' datagrid-column-fit':'') + '">'];
			tableStr.push('<tbody class="datagrid-body">');
			for(var i=0; i<data.length; i++)tableStr.push(_datagridMethods._makeTr.call(this, i, data[i], 'datagrid-row', i == data.length -1));
			if(data.length == 0)tableStr.push(_datagridMethods._makeTr.call(this, -1, null, 'datagrid-row', true));
			tableStr.push('</tbody></table>');
			this.tableBody.innerHTML = tableStr.join('');
			//初始化各部响应事件
			_datagridMethods._initTableDom.call(this, 'tbody', data);
			if(opts.showTotalRow)_datagridMethods._refreshTableRow.call(this, $('.datagrid-footer > tr.datagrid-total-row', this.tableFooter)[0], opts.totalrow);
		},
		_makeTable: function(data){
			var opts = this.options;
			opts.total = data.total;
			opts.data = data.rows;
			opts.attachData = data.attachData;
			data = _datagridMethods._getRows.call(this);
			//set pagination
			if(typeof this.topPagination == 'object')$(this.topPagination).pagination('refresh', {total: opts.total});
			if(typeof this.bottomPagination == 'object')$(this.bottomPagination).pagination('refresh', {total: opts.total});
			// table
			var cValue = '', cHtml = '', bStyle = '', tableStr = ['<table id="datagrid-table-' + opts.rowIdPrefix + '" class="datagrid-table' + (opts.fitColumns?' datagrid-column-fit':'') + '">'];
			// thead
			var fieldOpts = null, hStyle = '';
			if(opts.showHeader){
				tableStr.push('<thead class="datagrid-header">');
				for(var h1=0; h1<opts.columns.length; h1++){
					tableStr.push('<tr class="datagrid-header-row">');
					if(h1==0&&opts.rownumbers)tableStr.push('<td class="datagrid-cell datagrid-cell-first datagrid-td-rownumber"' + (opts.columns.length>1?(' rowspan="' + opts.columns.length + '"'):'') + '><span class="datagrid-header-rownumber">\u5e8f\u53f7</span></td>');
					for(var h2=0; h2<opts.columns[h1].length; h2++){
						fieldOpts = opts.columns[h1][h2];
						cHtml = fieldOpts.title;
						if(fieldOpts.sortable)cHtml += '<span class="datagrid-sort-icon">&nbsp;</span>';
						if(fieldOpts.checkbox)cHtml = opts.singleSelect?'&nbsp;':('<input type="checkbox"' + (data.length == 0?' disabled="disabled"':'') + ' />');
						fieldOpts.style = (fieldOpts.hidden?'display:none;':'') + (fieldOpts.align?('text-align:' + fieldOpts.align + ';'):'') + (fieldOpts.nowrap?('white-space:nowrap;'):'') + (!opts.fitColumns&&fieldOpts.width?('width:' + fieldOpts.width + 'px;'):'');
						hStyle = fieldOpts.style.replace(fieldOpts.align&&fieldOpts.halign?('text-align:' + fieldOpts.align + ';'):'', '') + (fieldOpts.halign?('text-align:' + fieldOpts.halign + ';'):'');
						tableStr.push('<td class="datagrid-cell');
						if(!opts.rownumbers&&h2==0)tableStr.push(' datagrid-cell-first');
						if((h1==0&&h2==opts.columns[h1].length-1) || (h1>0&&h2 == this.fields.length-1))tableStr.push(' datagrid-cell-last');
						if(fieldOpts.checkbox)tableStr.push(' datagrid-cell-checkbox');
						if(fieldOpts.rowspan>1)tableStr.push('" rowspan="' + fieldOpts.rowspan);
						if(fieldOpts.colspan>1)tableStr.push('" colspan="' + fieldOpts.colspan);
						if(hStyle)tableStr.push('" style="' + hStyle);
						tableStr.push('" field="' + fieldOpts.field + '">');
						tableStr.push((fieldOpts.checkbox?'':'<div class="datagrid-cell-inner">') + (cHtml!=null?cHtml:'') + (fieldOpts.checkbox?'</td>':'</div></td>'));
					}
					if(h1==0){
						tableStr.push('<td class="datagrid-cell-extend" field="datagrid-cell-extend"' + (opts.columns.length>1?(' rowspan="' + opts.columns.length + '"'):'') + (!opts.fitColumns&&this.hasFitColumn?' style="width:0"':'') + '></td>');
					}
					tableStr.push('</tr>');
				}
				tableStr.push('</thead>');
			}
			// tbody
			tableStr.push('<tbody class="datagrid-body">');
			for(var i=0; i<data.length; i++){
				tableStr.push(_datagridMethods._makeTr.call(this, i, data[i], 'datagrid-row', i == data.length -1));
			}
			if(data.length == 0)tableStr.push(_datagridMethods._makeTr.call(this, -1, null, 'datagrid-row', true));
			tableStr.push('</tbody>');
			// tfoot
			if(opts.showFooter){
				// total row
				tableStr.push('<tfoot class="datagrid-footer">');
				if(opts.showTotalRow)tableStr.push(_datagridMethods._makeTr.call(this, -1, opts.totalrow, 'datagrid-footer-row datagrid-total-row', true));
				tableStr.push('</tfoot>');
			}
			tableStr.push('</table>');
			this.tableBody.innerHTML = tableStr.join('');
			//初始化各部响应事件
			_datagridMethods._initTableDom.call(this, 'table', data);
		},
		_makeTfooter: function(){
			var opts = this.options, tableStr = ['<div class="datagrid-footer-inner"><table id="datagrid-table-footer-' + opts.rowIdPrefix + '" class="datagrid-table ">'];
			tableStr.push('<tfoot class="datagrid-footer">');
			if(opts.showTotalRow)tableStr.push(_datagridMethods._makeTr.call(this, -1, opts.totalrow, 'datagrid-footer-row datagrid-total-row', true));
			tableStr.push('</tfoot></table></div>');
			this.tableFooter.innerHTML = tableStr.join('');
			//初始化各部响应事件
			_datagridMethods._initTableDom.call(this, 'tfoot');
		},
		_remakeTbody: function(data){
			var opts = this.options;
			opts.total = data.total;
			opts.data = data.rows;
			opts.attachData = data.attachData;
			for(var i=0; i<this.fields.length; i++){
				if(this.fields[i].total)opts.totalrow[this.fields[i].field] = 0;
			}
			data = _datagridMethods._getRows.call(this);
			var table = document.createElement('TABLE');
			var bodys = table.appendChild(document.createElement('TBODY'));
			bodys.className = 'datagrid-body';
			for(var i=0; i<data.length; i++){
				_datagridMethods._remakeTr.call(this, bodys.insertRow(i), i, data[i], 'datagrid-row', i == data.length -1);
			}
			if(data.length == 0)_datagridMethods._remakeTr.call(this, bodys.insertRow(0), -1, null, 'datagrid-row', true);
			this.tableBody.children[0].replaceChild(bodys,this.tableBody.children[0].tBodies[0]);
			table = null;
			//初始化各部响应事件
			_datagridMethods._initTableDom.call(this, 're_tbody', data);
			if(opts.showTotalRow)_datagridMethods._refreshTableRow.call(this, $('.datagrid-footer > tr.datagrid-total-row', this.tableFooter)[0], opts.totalrow);
		},
		_wrapValue: function(value, data, index, fieldOpts){
			var opts = this.options, valueStr = [];
			value = fieldOpts.checkbox&&index>=0?('<input type="' + (opts.singleSelect?'radio':'checkbox') + '" value="' + value + '" name="' + fieldOpts.field + '" />'):(data&&fieldOpts.formatter?fieldOpts.formatter(value, data, index):value);
			valueStr.push(value == null?'':value);
			if(!fieldOpts.checkbox && (opts.componentMode ||  (!opts.fitColumns && fieldOpts.width!='auto' && fieldOpts.width!=null))){
				valueStr.unshift('<div class="datagrid-cell-inner"' + (opts.componentMode&&$.parseLength(value)<($.parseLength(fieldOpts.title) + (fieldOpts.sortable?2:0))?(' style="' + 'min-width:' + (fieldOpts.title.length + (fieldOpts.sortable?2:0)) + 'em;*width:' + (fieldOpts.title.length + (fieldOpts.sortable?2:0)) + 'em;"'):'') + '>');
				valueStr.push('</div>');
			}
			return valueStr.join('');
		},
		_initTr: function(tr, row){
			var _this = this, opts = _this.options;
			$(tr).unbind('.datagrid').bind('mouseover.datagrid', function(){$(this).addClass('datagrid-row-over');}).bind('mouseout.datagrid', function(){$(this).removeClass('datagrid-row-over');}).bind('click.datagrid', function(e){
				if(_this.merged)return;
				_this.sender = this;
				if($(this).is('.datagrid-row-selected')){
					if(!opts.singleSelect)
						_datagridMethods._unselectRow.call(_this, this);
				}
				else
					_datagridMethods._selectRow.call(_this, this);
				if(opts.onClickRow)opts.onClickRow.call(_this, this.getAttribute('datagrid-row-index'), this.data);
			}).bind('dblclick.datagrid', function(){
				if(_this.merged)return;
				_this.sender = this;
				if(!$(this).is('.datagrid-row-selected'))_datagridMethods._selectRow.call(_this, this);
				if(opts.onDblClickRow)opts.onDblClickRow.call(_this, this.getAttribute('datagrid-row-index'), this.data);
			}).children(':not(.datagrid-td-rownumber)').each(function(j){
				$(this).unbind('.datagrid').bind('click.datagrid', function(e){
					var field;
					if($(this).is('.datagrid-cell-extend')){
						_this.sender = $(this).prev()[0];
						field = _this.fields[j - 1].field;
					}else{
						_this.sender = this;
						field = _this.fields[j].field;
					}
					if(opts.onClickCell)opts.onClickCell.call(_this, this.parentNode.getAttribute('datagrid-row-index'), field, this.parentNode.data[field]);
				}).bind('dblclick.datagrid', function(e){
					var field;
					if($(this).is('.datagrid-cell-extend')){
						_this.sender = $(this).prev()[0];
						field = _this.fields[j - 1].field;
					}else{
						_this.sender = this;
						field = _this.fields[j].field;
					}
					if(opts.onDblClickCell)opts.onDblClickCell.call(_this, this.parentNode.getAttribute('datagrid-row-index'), field, this.parentNode.data[field]);
				});
				if(_this.hasCheckColumn && $(this).is('.datagrid-cell-checkbox')){
					$(this).children(':input').each(function(){
						$(this).unbind('.datagrid').bind('click.datagrid', function(e){
							if(_this.merged)return;
							_this.sender = this;
							if(this.checked)
								_datagridMethods._checkRow.call(_this, this);
							else
								_datagridMethods._uncheckRow.call(_this, this);
							e.stopPropagation();
						});
					});
				}
			});
			tr.data = row;
		},
		_makeTr: function(index, data, cls, isLast){
			var opts = this.options, rStyle = {}, cValue = '', bStyle = '', trStr = ['<tr class="'];
			rStyle.cssText = opts.rowStyler?opts.rowStyler(index, data):'';
			rStyle.isClass = rStyle.cssText.indexOf(':') < 0;
			trStr.push(cls);
			if(index==0||index==-1)trStr.push(' datagrid-row-first');
			if(isLast)trStr.push(' datagrid-row-last');
			if(index>=0&&opts.striped&&index%2)trStr.push(' datagrid-row-alt');
			if(!data)trStr.push(' datagrid-row-empty');
			if(index>=0&&rStyle.cssText&&rStyle.isClass)trStr.push(' ' + rStyle.cssText);
			if(index>=0&&rStyle.cssText&&!rStyle.isClass)trStr.push('" style="' + rStyle.cssText);
			if(index>=0)trStr.push('" datagrid-row-index="' + index);
			trStr.push('">');
			if(opts.rownumbers)trStr.push('<td class="datagrid-cell datagrid-cell-first datagrid-td-rownumber"><span class="datagrid-cell-rownumber">' + (index < 0?'&nbsp;':(index + 1 + (opts.pageNumber - 1) * opts.pageSize)) + '</span></td>');
			for(var i=0; data&&i<this.fields.length; i++){
				cValue = data[this.fields[i].field];
				bStyle = this.fields[i].style + (this.fields[i].styler?this.fields[i].styler(cValue, data, index):'');
				trStr.push('<td class="datagrid-cell');
				if(!opts.rownumbers&&i==0)trStr.push(' datagrid-cell-first');
				if(i==this.fields.length-1)trStr.push(' datagrid-cell-last');
				if(this.fields[i].checkbox)trStr.push(' datagrid-cell-checkbox');
				if(bStyle)trStr.push('" style="' + bStyle);
				if(this.fields[i].withTitle)trStr.push('" title="' + cValue);
				trStr.push('" field="' + this.fields[i].field + '">');
				trStr.push(_datagridMethods._wrapValue.call(this, cValue, data, index, this.fields[i]) + '</td>');
				if(index>=0&&this.fields[i].total&&cValue&&cValue.toString().replace(/\D/g, ''))opts.totalrow[this.fields[i].field] += parseInt(cValue.toString().replace(/\D/g, ''));
			}
			if(!data)trStr.push('<td class="datagrid-cell' + (opts.rownumbers?'':' datagrid-cell-first') + ' datagrid-cell-last datagrid-cell-extend" colspan="' + (_datagridMethods._getColumnFields.call(this, {hidden:false}).length + 1) + '">' + opts.emptyMsg);
			if(data)trStr.push('<td class="datagrid-cell-extend" field="datagrid-cell-extend"' + (index>=0&&!opts.fitColumns&&this.hasFitColumn?' style="width:0;"':'') + '></td>');
			trStr.push('</tr>');
			return trStr.join('');
		},
		_remakeTr: function(tr, index, data, cls, isLast){
			var opts = this.options, rStyle = {}, cValue = '', bStyle = '', cell, trStr;
			rStyle.cssText = opts.rowStyler?opts.rowStyler(index, data):'';
			rStyle.isClass = rStyle.cssText.indexOf(':') < 0;
			tr.className = cls;
			if(index==0||index==-1)tr.className += ' datagrid-row-first';
			if(isLast)tr.className += ' datagrid-row-last';
			if(index>=0&&opts.striped&&index%2)tr.className += ' datagrid-row-alt';
			if(!data)tr.className += ' datagrid-row-empty';
			if(index>=0&&rStyle.cssText&&rStyle.isClass)tr.className += ' ' + rStyle.cssText;
			if(index>=0&&rStyle.cssText&&!rStyle.isClass)tr.style.cssText = rStyle.cssText;
			if(index>=0)tr.setAttribute('datagrid-row-index', index);
			if(opts.rownumbers){
				cell = tr.insertCell(0);
				cell.className = 'datagrid-cell datagrid-cell-first datagrid-td-rownumber';
				cell.innerHTML = '<span class="datagrid-cell-rownumber">' + (index < 0?'&nbsp;':(index + 1 + (opts.pageNumber - 1) * opts.pageSize)) + '</span>';
			}
			for(var i=0; data&&i<this.fields.length; i++){
				cValue = data[this.fields[i].field];
				bStyle = this.fields[i].style + (this.fields[i].styler?this.fields[i].styler(cValue, data, index):'');
				cell = tr.insertCell(i + (opts.rownumbers?1:0));
				cell.className = 'datagrid-cell';
				if(!opts.rownumbers&&i==0)cell.className += ' datagrid-cell-first';
				if(i==this.fields.length-1)cell.className += ' datagrid-cell-last';
				if(this.fields[i].checkbox)cell.className += ' datagrid-cell-checkbox';
				if(bStyle)cell.style.cssText = bStyle;
				if(this.fields[i].withTitle)cell.title = cValue;
				cell.setAttribute('field', this.fields[i].field);
				cell.innerHTML = _datagridMethods._wrapValue.call(this, cValue, data, index, this.fields[i]);
				if(index>=0&&this.fields[i].total&&cValue&&cValue.toString().replace(/\D/g, ''))opts.totalrow[this.fields[i].field] += parseInt(cValue.toString().replace(/\D/g, ''));
			}
			if(!data){
				cell = tr.insertCell(opts.rownumbers?1:0);
				cell.className = 'datagrid-cell' + (opts.rownumbers?'':' datagrid-cell-first') + ' datagrid-cell-last datagrid-cell-extend';
				cell.setAttribute('colspan', _datagridMethods._getColumnFields.call(this, {hidden:false}).length + 1);
				cell.innerHTML = opts.emptyMsg;
			}
			if(data){
				cell = tr.insertCell(tr.cells.length);
				cell.className = 'datagrid-cell-extend';
				cell.setAttribute('field', 'datagrid-cell-extend');
				if(index>=0&&!opts.fitColumns&&this.hasFitColumn)cell.style.width = 0;
			}
			if(index>=0)_datagridMethods._initTr.call(this, tr, data);
		},
		_makePagination: function(){
			var opts = this.options, pagination = null;
			if(typeof this.topPagination != 'object' && opts.pagePosition != 'bottom'){
				pagination = this.owner.insertBefore(document.createElement("DIV"), this.owner.children[0]);
				pagination.position = 'top';
			}else{
				pagination = this.owner.appendChild(document.createElement("DIV"));
				pagination.position = 'bottom';
			}
			pagination.owner = this;
			pagination.className = 'datagrid-pager datagrid-pager-' + pagination.position;
			for(var i=0; i<opts.pageList.length; i++){
				if(opts.pageSize > opts.pageList[i])
					continue;
				else{
					if(opts.pageSize < opts.pageList[i])opts.pageList.splice(i, 0, opts.pageSize);
					break;
				}
			}
			$(pagination).pagination({
				total: opts.data?opts.total:0,
				pageNumber: opts.pageNumber,
				pageSize: opts.pageSize,
				pageList: opts.pageList,
				onSelectPage: function(pageNum, pageSize){
					opts.pageNumber = pageNum;
					opts.pageSize = pageSize;
					if(opts.data.length >= opts.pageNumber * opts.pageSize || opts.data.length == opts.total){
						opts.pagePointer = opts.pageNumber - 1;
						_datagridMethods._remakeTbody.call(this.owner, {total:opts.total, rows:opts.data});
					}else{
						_datagridMethods._request.call(this.owner, {});
					}
					if(opts.pagePosition == 'both'){
						if(this.position == 'top')
							$(this.owner.bottomPagination).pagination('refresh', {pageSize:opts.pageSize, pageNumber:pageNum})
						else	
							$(this.owner.topPagination).pagination('refresh', {pageSize:opts.pageSize, pageNumber:pageNum})
					}
				}
			});
			return pagination;
		},
		_makeLoading: function(){
			this.mask = this.owner.insertBefore(document.createElement('DIV'), this.owner.children[0]);
			this.mask.className = 'datagrid-mask';
			this.mask.style.height = (this.owner.offsetHeight<0?0:this.owner.clientHeight) + 'px';
			this.maskMsg = this.owner.insertBefore(document.createElement('DIV'), this.mask);
			this.maskMsg.className = 'datagrid-mask-msg';
			this.maskMsg.innerHTML = this.options.loadMsg;
		},
		_getColumnFields: function(param){
			var param = /^true|false$/.test(param)?{frozen:true}:param, fieldNames = [];
			for(var i=0; i<this.fields.length; i++){
				if(!param){
					fieldNames.push(this.fields[i].field);
					continue;
				}
				var matched = true;
				for(var attr in param){
					matched = matched && param[attr] != 'auto' && (this.fields[i][attr] == param[attr] || !!this.fields[i][attr] == param[attr]);
				}
				if(matched)fieldNames.push(this.fields[i].field);
			}
			return fieldNames;
		},
		_getColumnOption: function(field){
			for(var i=0; i<this.fields.length; i++){
				if(this.fields[i]['field'] == field)
					return this.fields[i];
			}
			return null;
		},
		_resizeTd: function(field){
			var opts = this.options, hTds, bTds, fTds, bTdField;
			if(opts.showHeader)hTds = this.tableHeader.children[0].children[0].tHead.rows[0].cells
			bTds = this.tableBody.children[0].tBodies[0].rows[0].cells;
			if(opts.showFooter)fTds = this.tableFooter.children[0].children[0].tFoot.rows[0].cells;
			var startIndex = 0 + (opts.rownumbers?1:0) + (this.hasCheckColumn?1:0)
			for(var i=startIndex; i<bTds.length; i++){
				bTdField = bTds[i].getAttribute('field');
				if(field && field != bTdField)continue;
				if(opts.showHeader)this.headerFieldTd[bTdField].style.width = (bTds[i].clientWidth<0?0:bTds[i].clientWidth) + 'px';
				if(opts.showFooter)fTds[i].style.width = (bTds[i].clientWidth<0?0:bTds[i].clientWidth) + 'px';
			}
		},
		_resize: function(param){
			var opts = this.options;
			if(param.width){
				this.owner.style.width = param.width=='auto'?'auto':((param.width<0?0:param.width) + 'px');
			}
			if(opts.componentMode){
				if(param.height=='auto'){
					this.datagridView.style.height = this.tableBody.style.height = 'auto';
				}else{
					var vHeight = param.height?param.height:this.owner.offsetHeight;
					if(!param.scrollbar)this.owner.style.height = vHeight<0?0:(vHeight + 'px');
					vHeight = vHeight - 1 - this.datagridView.offsetTop - (typeof this.bottomPagination == 'object'?(this.bottomPagination.offsetHeight - 2):0);
					if(!param.scrollbar)this.datagridView.style.height = vHeight<0?0:(vHeight + 'px');
					vHeight = vHeight<0?0:(vHeight - (typeof this.toolbar == 'object'?2:1) - (typeof this.tableHeader == 'object'?this.tableHeader.offsetHeight:0) - (typeof this.tableFooter == 'object'?this.tableFooter.clientHeight:0));
					this.tableBody.style.height = vHeight<0?0:(vHeight>=this.tableBody.scrollHeight?'auto':(vHeight + 'px'));
				}
				if(this.initialized){
					var _this = this;
					setTimeout(function(){_datagridMethods._resizeTd.call(_this)}, 100);
				}
			}
			if(typeof this.mask == 'object')this.mask.style.height = (this.owner.offsetHeight<0?0:this.owner.clientHeight) + 'px';
		},
		_request: function(param, isInit){
			var opts = this.options, qParam = $.extend({}, opts.queryParams, param);
			if (opts.pagination)$.extend(qParam, {page:opts.pageNumber, rows:opts.pageSize});
			if (opts.sortName)$.extend(qParam, {sort:opts.sortName, order:opts.sortOrder});
			if(opts.onBeforeLoad){
				var before = opts.onBeforeLoad.call(this, qParam);
				if(before != null && /^false$/.test(before.toString()))return;
			}
			if(opts.showLoading)_datagridMethods._loading.call(this);
			opts.loader.call(this, qParam, isInit?(!opts.componentMode?_datagridMethods._makeTable:_datagridMethods._makeTbody):_datagridMethods._remakeTbody, opts.onLoadError);
		},
		_load: function(param){
			var opts = this.options;
			opts.pageNumber = 1;
			opts.pagePointer = 0;
			if(typeof this.topPagination == 'object')$(this.topPagination).pagination('refresh', {pageNumber:1});
			if(typeof this.bottomPagination == 'object')$(this.bottomPagination).pagination('refresh', {pageNumber:1});
			_datagridMethods._request.call(this, param);
		},
		_reload: function(param){
			_datagridMethods._request.call(this, param);
		},
		_loading: function(){
			if(typeof this.mask != 'object')_datagridMethods._makeLoading.call(this);
			this.mask.style.display = this.maskMsg.style.display = 'block';
		},
		_loaded: function(){
			if(typeof this.mask == 'object')this.mask.style.display = this.maskMsg.style.display = 'none';
		},
		_loadData: function(data){
			var opts = this.options, data = opts.loadFilter.call(this, data);
			opts.pageNumber = 1;
			opts.pagePointer = 0;
			if(typeof this.topPagination == 'object')$(this.topPagination).pagination('refresh', {total:data.rows.length, pageNumber:1});
			if(typeof this.bottomPagination == 'object')$(this.bottomPagination).pagination('refresh', {total:data.rows.length, pageNumber:1});
			_datagridMethods._remakeTbody.call(this, data);
		},
		_sortData: function(){
			var opts = this.options, order = opts.sortOrder == 'asc'?1:-1;
			opts.data.sort(function(row1, row2){
				var value1 = row1[opts.sortName] == null?' ':row1[opts.sortName];
				var value2 = row2[opts.sortName] == null?' ':row2[opts.sortName];
				if(typeof value1 != 'number'){
					if(/^\d+$/.test(value1))
						value1 = parseInt(value1);
					else if(/^\d+\.\d+$/.test(value1))
						value1 = parseFloat(value1);
					else
						value2 = value2.toString();
				}
				if(typeof value1 == 'number' && typeof value2 != 'number'){
					if(/^\d+$/.test(value2))
						value2 = parseInt(value2);
					else if(/^\d+\.\d+$/.test(value2))
						value2 = parseFloat(value2);
					else 
						value1 = value1.toString();
				}
				if(typeof value1 == 'number' && typeof value2 == 'number'){
					if(value1 > value2)
						return order;
					else if(value1 < value2)
						return -order;
					else
						return 0;
				}else{
					return order * value1.localeCompare(value2);
				}
			});
		},
		_parseData: function(){
			var data = [], opts = this.options, cell, offset, rowSpan, colSpan, value;
			for(var i=0; i<this.tBodies.length; i++){
				for(var j=0; j<this.tBodies[i].rows.length; j++){
					offset = 0;
					for(var k=0; k<this.tBodies[i].rows[j].cells.length; k++){
						cell = this.tBodies[i].rows[j].cells[k];
						rowSpan = cell.getAttribute('rowspan')?parseInt(cell.getAttribute('rowspan')):1;
						for(var m=0; m<rowSpan; m++){
							if(!data[j + m])data.push({});
							colSpan = cell.getAttribute('colspan')?parseInt(cell.getAttribute('colspan')):1;
							for(var l=0; l<colSpan; l++){
								if(m == 0){
									for(var n=0; n<this.fields.length; n++){
										if(typeof data[j + m][this.fields[n].field] == 'undefined'){
											data[j + m][this.fields[n].field] = cell.innerHTML;
											break;
										}
									}
								}else{
									data[j + m][this.fields[offset + k + l].field] = cell.innerHTML;
								}
							}
							offset += colSpan - 1;
						}
					}
					opts.total++;
				}
			}
			opts.data = opts.data.concat(data);
		},
		_getRows: function(){
			var opts = this.options;
			return opts.pagination?opts.data.slice(opts.pagePointer * opts.pageSize, (opts.pagePointer + 1) * opts.pageSize):opts.data;
		},
		_getRowIndex: function(row){
			var rows = _datagridMethods._getRows.call(this);
			for(var i=0; i<rows.length; i++){
				if((typeof row=='object' && rows[i]==row) || (typeof row=='string' && rows[i][this.options.idField] == row)){
					return i;
				}
			}
			return -1;
		},
		_getChecked: function(){
			var checkrows = [];
			$('.datagrid-body > tr.datagrid-row:not(.datagrid-row-empty)', this.tableBody).each(function(){
				if($('.datagrid-cell-checkbox :input', this).prop('checked'))
					checkrows.push(this.data);
			});
			return checkrows;
		},
		_getSelected: function(){
			var table = this.tableBody.children[0], rows = table.tBodies[0].rows;
			if(this.merged){
				var selected = table.className.match(/datagrid\-row\d+\-selected/gi);
				if(!selected)return null;
				selected.sort(function(value1, value2){
					value1 = parseInt(value1.replace(/datagrid\-row(\d+)\-selected/, '$1'));
					value2 = parseInt(value2.replace(/datagrid\-row(\d+)\-selected/, '$1'));
					if(value1 > value2)
						return 1;
					else if(value1 < value2)
						return -1;
					else
						return 0;
				});
				return rows[selected[0].replace(/datagrid\-row(\d+)\-selected/, '$1')].data;
			}else{
				for(var i=0; i<rows.length; i++){
					if(rows[i].className.indexOf('datagrid-row-selected') >= 0){
						return rows[i].data;
					}
				}
			}
		},
		_getSelections: function(type){
			var table = this.tableBody.children[0], rows = table.tBodies[0].rows;selections = [];
			if(this.merged){
				var selected = table.className.match(/datagrid\-row\d+(?=\-selected)/gi);
				if(!selected)return [];
				selected.sort(function(value1, value2){
					value1 = parseInt(value1.replace('datagrid-row', ''));
					value2 = parseInt(value2.replace('datagrid-row', ''));
					if(value1 > value2)
						return 1;
					else if(value1 < value2)
						return -1;
					else
						return 0;
				});
				for(var i=0; i<selected.length; i++){
					selections.push(type == 'data'?rows[selected[i].replace('datagrid-row', '')].data:rows[selected[i].replace('datagrid-row', '')].getAttribute('datagrid-row-index'));
				}
			}else{
				for(var i=0; i<rows.length; i++){
					if(rows[i].className.indexOf('datagrid-row-selected') >= 0){
						selections.push(type == 'data'?rows[i].data:rows[i].getAttribute('datagrid-row-index'));
					}
				}
			}
			return selections;
		},
		_clearSelections: function(){
			var opts = this.options;
			if(this.merged){
				var table = this.tableBody.children[0], rows = table.tBodies[0].rows;
				var selected = table.className.match(/datagrid\-row\d+(?=\-selected)/gi);
				table.className = table.className.replace(/[ ]?datagrid\-row\d+\-selected/gi,'');
				if(opts.checkOnSelect&&this.hasCheckColumn){
					for(var i=0; i<selected.length; i++){
						$('.datagrid-cell-checkbox :input', rows[selected[i].replace('datagrid-row', '')]).prop('checked', false);
					}
				}
			}else{
				$('.datagrid-body > tr.datagrid-row-selected').each(function(){
					$(this).removeClass('datagrid-row-selected');
					if(opts.checkOnSelect&&this.hasCheckColumn)$('.datagrid-cell-checkbox :input', this).prop('checked', false);
				});
			}
		},
		_clearChecked: function(){
			var opts = this.options;
			$('.datagrid-cell-checkbox :input', this.datagridView).each(function(){
				if(this.checked){
					this.checked = false;
					if(opts.selectOnCheck){
						if(this.merged){
							$(this.tableBody.children[0]).removeClass(this.parentNode.className.match(/datagrid\-row\d+/gi).join(' '));
						}else{
							$(this).closest('.datagrid-row').removeClass('datagrid-row-selected');
						}
					}
				}
			});
		},
		_selectMergedAll: function(){
			var opts = this.options, table = this.tableBody.children[0], rows = table.tBodies[0].rows, classText = [], cssText = [];
			var datagridCellSelectedStyle = document.getElementById(this.id + 'DatagridCellSelectedStyle');
			for(var i=0; i<rows.length; i++){
				classText.push(' datagrid-row' + i + '-selected');
				cssText.push('.pera-datagrid .datagrid-row' + i + '-selected .datagrid-row' + i);
			}
			table.className = table.className.replace(/[ ]?datagrid\-row\d+\-selected/gi,'') + classText.join('');
			if(datagridCellSelectedStyle.styleSheet){
				datagridCellSelectedStyle.styleSheet.cssText = '';
				datagridCellSelectedStyle.styleSheet.cssText = cssText.join(',') + '{background:' + opts.rowSelectedColor + ';}';
			}else{
				datagridCellSelectedStyle.innerHTML = '';
				datagridCellSelectedStyle.innerHTML = cssText.join(',') + '{background:' + opts.rowSelectedColor + ';}';
			}
		},
		_selectAll: function(){
			var opts = this.options;
			if(opts.singleSelect)return;
			var rows = null;
			if(this.merged)
				_datagridMethods._selectMergedAll.call(this);
			else
				$('.datagrid-body > tr.datagrid-row:not(.datagrid-row-empty)', this.tableBody).addClass('datagrid-row-selected');
			if(opts.onSelectAll)opts.onSelectAll.call(this, _datagridMethods._getRows.call(this));
			if(opts.checkOnSelect&&this.hasCheckColumn){
				$('.datagrid-cell-checkbox :input', this.datagridView).prop('checked', true);
				if(opts.onCheckAll)opts.onCheckAll.call(this, _datagridMethods._getRows.call(this));
			}
		},
		_unselectMergedAll: function(){
			var opts = this.options, table = this.tableBody.children[0];
			var datagridCellSelectedStyle = document.getElementById(this.id + 'DatagridCellSelectedStyle');
			table.className = table.className.replace(/[ ]?datagrid\-row\d+\-selected/gi,'');
			if(datagridCellSelectedStyle.styleSheet)
				datagridCellSelectedStyle.styleSheet.cssText = '';
			else
				datagridCellSelectedStyle.innerHTML = '';
		},
		_unselectAll: function(){
			var opts = this.options;
			if(this.merged)
				_datagridMethods._unselectMergedAll.call(this);
			else
				$('.datagrid-body > tr.datagrid-row:not(.datagrid-row-empty)', this.tableBody).removeClass('datagrid-row-selected');
			if(opts.onUnselectAll)opts.onUnselectAll.call(this, _datagridMethods._getRows.call(this));
			if(opts.checkOnSelect&&this.hasCheckColumn){
				$('.datagrid-cell-checkbox :input', this.datagridView).prop('checked', false);
				if(opts.onUncheckAll)opts.onUncheckAll.call(this, _datagridMethods._getRows.call(this));
			}
		},
		_selectRow: function(index){
			var target = null, opts = this.options;
			if(typeof(index)=='object'){
				target = index;
				index = $(target).attr('datagrid-row-index');
			}else{
				target = $('tr[datagrid-row-index="' + index + '"]', this.tableBody)[0];
				if(!target)return;
			}
			if(opts.singleSelect)$('tr', this.tableBody).removeClass('datagrid-row-selected');
			$(target).addClass('datagrid-row-selected');
			if(opts.checkOnSelect && this.hasCheckColumn && $('.datagrid-row:not(.datagrid-row-selected)', this.tableBody).length == 0)$('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader).prop('checked', true);
			if(opts.onSelect)opts.onSelect.call(this, index, target.data);
			if(opts.checkOnSelect&&this.hasCheckColumn){
				$('.datagrid-cell-checkbox :input', target).prop('checked', true);
				if(opts.onCheck)opts.onCheck.call(this, index, target.data);
			}
		},
		_selectRecord: function(idValue){
			var _this = this, opts = _this.options;
			$('.datagrid-body > tr.datagrid-row:not(.datagrid-row-empty)', this.tableBody).each(function(){
				if(this.data[opts.idField] == idValue){
					if(_this.merged)
						_datagridMethods._onMergedCellClick.call(_this, $('[field="' + opts.idField + '"]', this)[0]);
					else
						_datagridMethods._selectRow.call(_this, this);
				}
			});
		},
		_unselectRow: function(index){
			var target = null, opts = this.options;
			if(typeof(index)=='object'){
				target = index;
				index = $(target).attr('datagrid-row-index');
			}else{
				target = $('tr[datagrid-row-index="' + index + '"]', this.tableBody)[0];
				if(!target)return;
			}
			if(opts.checkOnSelect&&this.hasCheckColumn)$('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader).prop('checked', false);
			$(target).removeClass('datagrid-row-selected');
			if(opts.onUnselect)opts.onUnselect.call(this, index, target.data);
			if(opts.checkOnSelect&&this.hasCheckColumn){
				$('.datagrid-cell-checkbox :input', target).prop('checked', false);
				if(opts.onUncheck)opts.onUncheck.call(this, index, target.data);
			}
		},
		_checkAll: function(){
			var opts = this.options;
			if(opts.singleSelect || !this.hasCheckColumn)return;
			$('.datagrid-cell-checkbox :input', this.datagridView).prop('checked', true);
			if(opts.onCheckAll)opts.onCheckAll.call(this, _datagridMethods._getRows.call(this));
			if(opts.selectOnCheck){
				if(this.merged)
					_datagridMethods._selectMergedAll.call(this);
				else
					$('.datagrid-body > tr.datagrid-row:not(.datagrid-row-empty)', this.tableBody).addClass('datagrid-row-selected');
				if(opts.onSelectAll)opts.onSelectAll.call(this, _datagridMethods._getRows.call(this));
			}
		},
		_uncheckAll: function(){
			var opts = this.options;
			if(!this.hasCheckColumn)return;
			$('.datagrid-cell-checkbox :input', this.datagridView).prop('checked', false);
			if(opts.onUncheckAll)opts.onUncheckAll.call(this, _datagridMethods._getRows.call(this));
			if(opts.selectOnCheck){
				if(this.merged)
					_datagridMethods._unselectMergedAll.call(this);
				else
					$('.datagrid-body > tr.datagrid-row:not(.datagrid-row-empty)', this.tableBody).removeClass('datagrid-row-selected');
				if(opts.onUnselectAll)opts.onUnselectAll.call(this, _datagridMethods._getRows.call(this));
			}
		},
		_checkRow: function(index){
			var target = null, opts = this.options;
			if(typeof(index)=='object'){
				target = index;
			}else{
				target = $('tr.datagrid-row[datagrid-row-index="' + index + '"] .datagrid-cell-checkbox :input', this.tableBody)[0];
				if(!target)return;
			}
			var row = $(target).closest('.datagrid-row');
			if(!this.hasCheckColumn)return;
			if(opts.singleSelect){
				if(opts.selectOnCheck)$('tr', this.datagridView).removeClass('datagrid-row-selected');
			}
			if(typeof(index)!='object')$(target).prop('checked', true);
			if(!opts.singleSelect){
				var ckbs = $('.datagrid-row .datagrid-cell-checkbox :checkbox', this.tableBody), ckbAll = $('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader);
				for(var i=0; i<ckbs.length; i++){
					ckbAll.prop('checked', ckbs[i].checked);
					if(!ckbs[i].checked)break;
				}
			}
			if(opts.onCheck)opts.onCheck.call(this, row.attr('datagrid-row-index'), row[0].data);
			if(opts.selectOnCheck){
				row.addClass('datagrid-row-selected');
				if(opts.onSelect)opts.onSelect.call(this, row.attr('datagrid-row-index'), row[0].data);
			}
		},
		_uncheckRow: function(index){
			var target = null, opts = this.options;
			if(typeof(index)=='object'){
				target = index;
			}else{
				target = $('tr.datagrid-row[datagrid-row-index="' + index + '"] .datagrid-cell-checkbox :input', this.tableBody)[0];
				if(!target)return;
			}
			var row = $(target).closest('.datagrid-row');
			if(!this.hasCheckColumn)return;
			if(opts.singleSelect){
				if(opts.selectOnCheck)$('tr', this.datagridView).removeClass('datagrid-row-selected');
			}else{
				$('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader).prop('checked', false);
			}
			if(typeof(index)!='object')$(target).prop('checked', false);
			if(opts.onUncheck)opts.onUncheck.call(this, row.attr('datagrid-row-index'), row[0].data);
			if(opts.selectOnCheck){
				row.removeClass('datagrid-row-selected');
				if(opts.onUnselect)opts.onUnselect.call(this, row.attr('datagrid-row-index'), row[0].data);
			}
		},
		_editRow: function(index){
			var _this = this, editor = null;
			$('.datagrid-body > tr.datagrid-row[datagrid-row-index="' + index + '"]:not(.datagrid-row-empty) > td.datagrid-cell[field]:not(.datagrid-cell-checkbox)', this.tableBody).each(function(){
				editor = _datagridMethods._getColumnOption.call(_this, $(this).attr('field')).editor;
				if(editor){
					_datagridMethods.__editCell.call(_this, this, editor);
				}
			});
		},
		_editColumn: function(fields){
			var _this = this;
			fields = typeof fields == 'string'?fields.split(','):fields;
			for(var i=0; i<fields.length; i++){
				var editor = _datagridMethods._getColumnOption.call(_this, fields[i]).editor;
				if(!editor)continue;
				$('.datagrid-body > tr.datagrid-row:not(.datagrid-row-empty) > td.datagrid-cell[field="' + fields[i] + '"]', this.tableBody).each(function(){
					_datagridMethods.__editCell.call(_this, this, editor);
				});
			}
		},
		_editCell: function(cell){
			cell = cell.nodeName?cell:$('.datagrid-body > tr.datagrid-row[datagrid-row-index="' + cell.index + '"]:not(.datagrid-row-empty) > td.datagrid-cell[field="' + cell.field + '"]', this.tableBody)[0];
			var editor = _datagridMethods._getColumnOption.call(this, $(cell).attr('field')).editor;
			if(editor)_datagridMethods.__editCell.call(this, cell, editor);
		},
		__editCell: function(cell, editor){
			var opts = this.options;
			if($(cell).is('.datagrid-editable'))return;
			if(typeof editor == "string")editor = {type:editor, options:{}};
			cell.className += ' datagrid-editable ' + editor.type;
			cell.editor = {
				owner: cell,
				owntr: cell.parentNode,
				actions: opts.editors,
				field: $(cell).attr('field'),
				type: editor.type,
				oldHtml: cell.innerHTML,
				oldValue: $(cell).text()
			};
			cell.innerHTML = opts.fitColumns?'':'<div class="datagrid-cell-inner"></div>';
			cell.editor.target = opts.editors.init(cell, editor.options);
			if(opts.componentMode && this.initialized)_datagridMethods._resizeTd.call(this, cell.editor.field);
		},
		_beginEdit: function(index){
			if(typeof index == "number" || (typeof index == "string" && /^\d+$/.test(index))){
				_datagridMethods._editRow.call(this, index);
				return;
			}
			if(typeof index == "object" && !(index instanceof Array)){
				_datagridMethods._editCell.call(this, index);
				return;
			}
			_datagridMethods._editColumn.call(this, index);
		},
		_editedRow: function(index, ifCancel){
			var _this = this;
			$('.datagrid-body > tr.datagrid-row[datagrid-row-index="' + index + '"]:not(.datagrid-row-empty) > td.datagrid-cell[field]:not(.datagrid-cell-checkbox)', this.tableBody).each(function(){
				if(this.editor)_datagridMethods.__editedCell.call(_this, this, ifCancel);
			});
		},
		_editedColumn: function(fields, ifCancel){
			var _this = this;
			fields = typeof fields == 'string'?fields.split(','):fields;
			for(var i=0; i<fields.length; i++){
				$('.datagrid-body > tr.datagrid-row:not(.datagrid-row-empty) > td.datagrid-cell[field="' + fields[i] + '"]', this.tableBody).each(function(){
					if(this.editor)_datagridMethods.__editedCell.call(_this, this, ifCancel);
				});
			}
		},
		_editedCell: function(param, ifCancel){
			var cell = param.nodeName?param:$('.datagrid-body > tr.datagrid-row[datagrid-row-index="' + param.index + '"]:not(.datagrid-row-empty) > td.datagrid-cell[field="' + param.field + '"]', this.tableBody)[0];
			if(cell)_datagridMethods.__editedCell.call(this, cell, ifCancel);
		},
		__editedCell: function(cell, ifCancel){
			var opts = this.options;
			if(!ifCancel){
				var tr = cell.editor.owntr, fieldOpts = _datagridMethods._getColumnOption.call(this, cell.editor.field), value = cell.editor.actions.getValue(cell.editor.target);
				tr.data[cell.editor.field] = value;
				cell.innerHTML = _datagridMethods._wrapValue.call(this, value, tr.data, $(tr).attr('datagrid-row-index'), this.fields[i]);
			}else{
				cell.innerHTML = cell.editor.oldHtml;
			}
			cell.editor.actions.destroy(cell);
			if(opts.componentMode && this.initialized)_datagridMethods._resizeTd.call(this, cell.editor.field);
		},
		_endEdit: function(index){
			if(typeof index == "number" || (typeof index == "string" && /^\d+$/.test(index))){
				_datagridMethods._editedRow.call(this, index);
				return;
			}
			if(typeof index == "object" && !(index instanceof Array)){
				_datagridMethods._editedCell.call(this, index);
				return;
			}
			_datagridMethods._editedColumn.call(this, index);
		},
		_cancelEdit: function(index){
			if(typeof index == "number" || (typeof index == "string" && /^\d+$/.test(index))){
				_datagridMethods._editedRow.call(this, index, true);
				return;
			}
			if(typeof index == "object" && !(index instanceof Array)){
				_datagridMethods._editedCell.call(this, index, true);
				return;
			}
			_datagridMethods._editedColumn.call(this, index, true);
		},
		_getEditors: function(index){
			var editors = [];
			$('.datagrid-body > tr.datagrid-row[datagrid-row-index="' + index + '"] > td.datagrid-cell', this.tableBody).each(function(){
				editors.push(this.editor);
			});
			return editors;
		},
		_getEditor: function(options){
			var cell = $('.datagrid-body > tr.datagrid-row[datagrid-row-index="' + options.index + '"] > td.datagrid-cell[field="' + options.field + '"]', this.tableBody)[0];
			return cell?cell.editor:null;
		},
		_refreshTableRow: function(tr, row){
			var opts = this.options, cell, fieldOpts;
			for(var field in row){
				fieldOpts = _datagridMethods._getColumnOption.call(this, field);
				cell = $('td[field="' + field + '"]', tr)[0];
				if(fieldOpts.checkbox || !cell)continue;
				if(cell.editor)cell.editor.actions.destroy(cell);
				if(!$(tr).is('.datagrid-total-row')&&fieldOpts.total){
					if(tr.data[field]&&tr.data[field].toString().replace(/\D/g, ''))opts.totalrow[field] -= parseInt(tr.data[field].toString().replace(/\D/g, ''));
					if(row[field]&&row[field].toString().replace(/\D/g, ''))opts.totalrow[field] += parseInt(row[field].toString().replace(/\D/g, ''));
				}
				tr.data[field] = row[field];
				cell.innerHTML = _datagridMethods._wrapValue.call(this, tr.data[field], tr.data, $(tr).attr('datagrid-row-index'), fieldOpts);
			}
			if(opts.componentMode && !row.totalrow)_datagridMethods._resizeTd.call(this);
		},
		_refreshRow: function(index){
			var opts = this.options;
			var tr = $('.datagrid-body > tr.datagrid-row[datagrid-row-index="' + index + '"]:not(.datagrid-row-empty)', this.tableBody)[0];
			if(tr){
				_datagridMethods._refreshTableRow.call(this, tr, _datagridMethods._getRows.call(this)[index]);
				if(opts.showTotalRow)_datagridMethods._refreshTableRow.call(this, $('.datagrid-footer > tr.datagrid-total-row', this.tableFooter)[0], opts.totalrow);
			}
		},
		_updateRow: function(param){
			var opts = this.options;
			if(param.index > opts.total)return;
			var tr = $('.datagrid-body > tr.datagrid-row[datagrid-row-index="' + param.index + '"]:not(.datagrid-row-empty)', this.tableBody)[0];
			if(tr){
				_datagridMethods._refreshTableRow.call(this, tr, param.row);
				if(opts.showTotalRow)_datagridMethods._refreshTableRow.call(this, $('.datagrid-footer > tr.datagrid-total-row', this.tableFooter)[0], opts.totalrow);
			}else{
				for(var f in opts.data[param.index])opts.data[param.index][f] = param.row[f];
			}
		},
		_initOnTableRowChange: function(){
			var opts = this.options, trs = this.tableBody.children[0].tBodies[0].rows;
			if(this.hasCheckColumn)$('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader).prop('disabled', !trs.length).prop('checked', false);
			for(var i=0; i<trs.length; i++){
				trs[i].className = 'datagrid-row';
				if(i==0)trs[i].className += ' datagrid-row-first';
				trs[i].setAttribute('datagrid-row-index', i);
				if(!trs[i].nextSibling)trs[i].className += ' datagrid-row-last';
				if(opts.striped&&i%2)trs[i].className += ' datagrid-row-alt';
				if(opts.rownumbers)trs[i].children[0].children[0].innerHTML = i + 1 + (opts.pagination?(opts.pageNumber - 1) * opts.pageSize:0);
			}
			if(opts.showTotalRow)_datagridMethods._refreshTableRow.call(this, $('.datagrid-footer > tr.datagrid-total-row', this.tableFooter)[0], opts.totalrow);
			if(typeof this.topPagination == 'object')$(this.topPagination).pagination('refresh', {total: opts.total});
			if(typeof this.bottomPagination == 'object')$(this.bottomPagination).pagination('refresh', {total: opts.total});
		},
		_appendRow: function(row){
			var opts = this.options, index = _datagridMethods._getRows.call(this).length;
			opts.data.push(row);
			opts.total++;
			if(opts.pagination && index >= opts.pageSize)return;
			if(this.merged)_datagridMethods._breakCells.call(this);
			$('.datagrid-body > tr.datagrid-row-empty', this.tableBody).remove();
			var tbody = this.tableBody.children[0].tBodies[0];
			var tr = tbody.insertRow(tbody.rows.length);
			_datagridMethods._remakeTr.call(this, tr, index, row, 'datagrid-row', true);
			_datagridMethods._initOnTableRowChange.call(this);
		},
		_insertRow: function(param){
			var opts = this.options;
			if(param.index < 0 || param.index > opts.total)return;
			if(opts.total == 0 || param.index == null){_datagridMethods._appendRow.call(this, param.row); return;}
			opts.data.splice(param.index + (opts.pageNumber - 1) * opts.pageSize, 0, param.row);
			opts.total++;
			if(opts.pagination && param.index >= opts.pageSize)return;
			if(this.merged)_datagridMethods._breakCells.call(this);
			$('.datagrid-body > tr.datagrid-row-empty', this.tableBody).remove();
			var tbody = this.tableBody.children[0].tBodies[0];
			var tr = tbody.insertRow(param.index);
			_datagridMethods._remakeTr.call(this, tr, param.index, param.row, 'datagrid-row', false);
			if(opts.pagination && tbody.rows.length > opts.pageSize){
				var moreTr = tbody.rows[opts.pageSize];
				for(var i=0; i<this.fields.length; i++){
					var value = moreTr.data[this.fields[i].field];
					if(this.fields[i].total&&value&&value.toString().replace(/\D/g, ''))opts.totalrow[this.fields[i].field] -= parseInt(value.toString().replace(/\D/g, ''));
				}
				tbody.deleteRow(opts.pageSize);
			}
			_datagridMethods._initOnTableRowChange.call(this);
		},
		_deleteRow: function(index){
			var opts = this.options;
			if(index < 0 || index > opts.total)return;
			var tbody = this.tableBody.children[0].tBodies[0];
			var tr = tbody.rows[index];
			if(!tr||!tr.data)return;
			if(this.merged)_datagridMethods._breakCells.call(this);
			opts.data.splice(index + (opts.pageNumber - 1) * opts.pageSize, 1);
			opts.total--;
			for(var i=0; i<this.fields.length; i++){
				var value = tr.data[this.fields[i].field];
				if(this.fields[i].total&&value&&value.toString().replace(/\D/g, ''))opts.totalrow[this.fields[i].field] -= parseInt(value.toString().replace(/\D/g, ''));
			}
			tbody.deleteRow(index);
			if(opts.pagination && opts.total >= opts.pageNumber * opts.pageSize){
				tr = tbody.insertRow(tbody.rows.length);
				_datagridMethods._remakeTr.call(this, tr, opts.pageSize - 1, opts.data[opts.pageNumber * opts.pageSize - 1], 'datagrid-row', true);
			}
			_datagridMethods._initOnTableRowChange.call(this);
			if(opts.total == 0){
				tr = tbody.insertRow(0);
				_datagridMethods._remakeTr.call(this, tr, -1, null, 'datagrid-row', true);
			}
		},
		_deleteSelections: function(){
			var selections = _datagridMethods._getSelections.call(this, 'index');
			for(var i=selections.length - 1; i>=0; i--){
				_datagridMethods._deleteRow.call(this, selections[i]);
			}
		},
		_onMergedCellClick: function(sender){
			var nodeName = sender.nodeName, opts = this.options, _sender = sender;
			if(nodeName == 'INPUT')sender = sender.parentNode;
			var pNode = sender.parentNode, pIndex = pNode.getAttribute('datagrid-row-index');
			this.sender = pNode;
			if(nodeName == 'TD' || opts.selectOnCheck){
				var cls = sender.className.match(/datagrid\-row\d+/gi), table = this.tableBody.children[0], $table = $(table), tbody = table.tBodies[0];
				var datagridCellSelectedStyle = document.getElementById(this.id + 'DatagridCellSelectedStyle');
				var isSelected = nodeName == 'TD'?true:!_sender.checked;
				if(opts.singleSelect){
					if(nodeName == 'TD'){
						var selected = table.className.match(/datagrid\-row\d+(?=\-selected)/gi) || [];
						isSelected = selected.length > 0 && $(sender).is('.' + selected.join(',.'));
					}
					if(!isSelected){
						_datagridMethods._unselectMergedAll.call(this);
						table.className += ' ' + cls[0] + '-selected';
						if(nodeName == 'TD' && opts.checkOnSelect && this.hasCheckColumn)$('.datagrid-cell-checkbox :input', sender.parentNode).prop('checked', true);
					}
				}else{
					if(nodeName == 'TD'){
						for(var i=0; i<cls.length; i++){
							isSelected = isSelected && table.className.indexOf(cls[i] + '-selected') >=0;
						}
					}
					if(isSelected){
						$table.removeClass(cls.join('-selected ') + '-selected');
						if(nodeName == 'TD' && opts.checkOnSelect && this.hasCheckColumn){
							for(var i=0; i<cls.length; i++){
								$('.datagrid-cell-checkbox :input', tbody.rows[cls[i].replace('datagrid-row', '')]).prop('checked', false);
							}
						}
						if((nodeName == 'INPUT' || opts.checkOnSelect) && this.hasCheckColumn)$('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader).prop('checked', false);
					}else{
						$table.addClass(cls.join('-selected ') + '-selected');
						if(nodeName == 'TD' && opts.checkOnSelect && this.hasCheckColumn){
							for(var i=0; i<cls.length; i++){
								$('.datagrid-cell-checkbox :input', tbody.rows[cls[i].replace('datagrid-row', '')]).prop('checked', true);
							}
						}
						if((nodeName == 'INPUT' || opts.checkOnSelect) && this.hasCheckColumn && table.className.match(/datagrid\-row\d+(?=\-selected)/gi).length == tbody.rows.length)$('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader).prop('checked', true);
					}
				}
				if(!opts.singleSelect || (opts.singleSelect && !isSelected)){
					var cssText = '';
					for(var i=0; i<cls.length; i++){cssText += '.pera-datagrid .' + cls[i] + '-selected .' + cls[i] + (i != (cls.length-1)?',':'');}
					cssText += '{background:' + opts.rowSelectedColor + ';}';
					if(datagridCellSelectedStyle.innerHTML.indexOf(cssText) < 0){
						if(datagridCellSelectedStyle.styleSheet)
							datagridCellSelectedStyle.styleSheet.cssText = datagridCellSelectedStyle.innerHTML + cssText;
						else 
							datagridCellSelectedStyle.innerHTML = datagridCellSelectedStyle.innerHTML + cssText;
					}
				}
				if(nodeName == 'TD' && opts.onClickRow)opts.onClickRow.call(this, pIndex, pNode.data);
				if(isSelected){
					if(!opts.singleSelect){
						if(opts.onUnselect)opts.onUnselect.call(this, pIndex, pNode.data);
						if((nodeName == 'INPUT' || opts.checkOnSelect) && this.hasCheckColumn && opts.onUncheck)opts.onUncheck.call(this, pIndex, pNode.data);
					}
				}else{
					if(opts.onSelect)opts.onSelect.call(this, pIndex, pNode.data);
					if((nodeName == 'INPUT' || opts.checkOnSelect) && this.hasCheckColumn && opts.onCheck)opts.onCheck.call(this, pIndex, pNode.data);
				}
			}else if(nodeName == 'INPUT' && !opts.selectOnCheck){
				if(_sender.checked){
					if(opts.onCheck)opts.onCheck.call(this, pIndex, pNode.data);
					if(!opts.singleSelect){
						var ckbs = $('.datagrid-row .datagrid-cell-checkbox :checkbox', this.tableBody), ckbAll = $('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader);
						for(var i=0; i<ckbs.length; i++){
							ckbAll.prop('checked', ckbs[i].checked);
							if(!ckbs[i].checked)break;
						}
					}
				}else{
					if(opts.onUncheck)opts.onUncheck.call(this, pIndex, pNode.data);
					if(!opts.singleSelect)$('.datagrid-header-row .datagrid-cell-checkbox :checkbox', this.tableHeader).prop('checked', false);
				}
			}
		},
		_initMergedRow: function(){
			var _this = this, table = this.tableBody.children[0], $table = $(table), tbody = table.tBodies[0], cell, $cell;
			var datagridCellOver = document.getElementById('datagridCellOver');
			if(!datagridCellOver)datagridCellOver = $('<style id="datagridCellOver" type="text/css" />').appendTo(document.body)[0];
			$('<style id="' + this.id + 'DatagridCellSelectedStyle" type="text/css" />').appendTo(document.body)[0];
			for(var i=0; i<tbody.rows.length; i++){
				for(var j=0; j<tbody.rows[i].cells.length; j++){
					cell = tbody.rows[i].cells[j], $cell = $(cell);
					$cell.addClass('datagrid-row' + i);
					cell.rowspan = parseInt(cell.getAttribute('rowSpan')) || 1;
					if(cell.rowspan > 1)for(var k=1; k<cell.rowspan; k++){$cell.addClass('datagrid-row' + (i + k));}
					$cell.bind('mouseover.merged', function(){
						var opts = _this.options, cls = this.className.match(/datagrid\-row\d+/gi);
						if(this.rowspan > 100){
							table.className += ' ' + cls[0];
							var cssText = '';
							if(opts.singleSelect)
								cssText += '.' + cls[0] + ' .' + cls[0];
							else
								for(var l=0; l<cls.length; l++){cssText += '.' + cls[l] + ' .' + cls[l] + (l != (cls.length-1)?',':'');}
							cssText += '{background:' + opts.rowOverColor + ';}';
							if(datagridCellOver.styleSheet)
								datagridCellOver.styleSheet.cssText = datagridCellOver.innerHTML + cssText;
							else
								datagridCellOver.innerHTML = cssText;
						}else{
							if(opts.singleSelect)
								$(tbody).find('.' + cls[0]).addClass('datagrid-cell-over');
							else
								$(tbody).find('.' + cls.join(',.')).addClass('datagrid-cell-over');
						}
					}).bind('mouseout.merged', function(){
						var opts = _this.options, cls = this.className.match(/datagrid\-row\d+/gi);
						if(this.rowspan > 100){
							table.className = table.className.replace(/ datagrid\-row\d+(?![\-])/gi, '');
							if(datagridCellOver.styleSheet)
								datagridCellOver.styleSheet.cssText = '';
							else
								datagridCellOver.innerHTML = '';
						}else{
							if(opts.singleSelect)
								$(tbody).find('.'+ cls[0]).removeClass('datagrid-cell-over');
							else
								$(tbody).find('.'+ cls.join(',.')).removeClass('datagrid-cell-over');
						}
					}).bind('click.merged', function(){
						_datagridMethods._onMergedCellClick.call(_this, this);
					});
					if(_this.hasCheckColumn && $cell.is('.datagrid-cell-checkbox')){
						$cell.children(':input').each(function(){
							$(this).unbind('.merged').bind('click.merged', function(e){
								_this.sender = this;
								_datagridMethods._onMergedCellClick.call(_this, this);
								e.stopPropagation();
							});
						});
					}
				}
			}
		},
		_mergeCells: function(options){
			var opts = this.options, tbody = this.tableBody.children[0].tBodies[0], fields = typeof options.field == 'string'?options.field.split(','):options.field;
			for(var i=0; i<fields.length; i++){
				var fieldOpts = _datagridMethods._getColumnOption.call(this, fields[i]);
				if(!fieldOpts || fieldOpts.checkbox)continue;
				var tr = tbody.rows[options.index];
				if(!tr)return;
				options.rowspan = options.rowspan || 1;
				if(options.rowspan > 1)tr.cells[fieldOpts.index].setAttribute('rowSpan', options.rowspan);
				if(options.rowspan > 1 && fieldOpts.index == tr.cells.length - 2)tr.cells[tr.cells.length - 1].setAttribute('rowSpan', options.rowspan);
				for(var j=0; j<options.rowspan; j++){
					if(j > 0)tbody.rows[options.index + j].cells[fieldOpts.index].className += ' datagrid-cell-merged';
					if(j > 0 && fieldOpts.index == tr.cells.length - 2)tbody.rows[options.index + j].cells[tr.cells.length - 1] += ' datagrid-cell-merged'
					options.colspan = options.colspan || 1;
					if(options.colspan > 1)tbody.rows[options.index + j].cells[fieldOpts.index].setAttribute('colSpan', options.colspan);
					for(var k=1; k<options.colspan; k++){
						tbody.rows[options.index + j].cells[fieldOpts.index + k] += ' datagrid-cell-merged';
					}
				}
			}
			this.merged = true;
		},
		_mergeCellsByField: function(fields){
			fields = typeof fields == 'string'?fields.split(','):fields;
			var tbody = this.tableBody.children[0].tBodies[0];
			if(!tbody.rows[0].data)return;
			var span, preValue, value;
			for(var i=fields.length-1; i>=0; i--){
				if(!_datagridMethods._getColumnOption.call(this, fields[i]))continue;
				preValue = '';
				span = 1;
				for(var j=0; j<=tbody.rows.length; j++){
					if(j == tbody.rows.length)
						value = '';
					else
						value = tbody.rows[j].data[fields[i]];
					if(preValue == value)
						span += 1;
					else{
						_datagridMethods._mergeCells.call(this, {index: j-span, field: fields[i], rowspan: span});
						span = 1;
					}
					preValue = value;
				}
			}
			if(this.merged)_datagridMethods._initMergedRow.call(this);
		},
		_breakCells: function(){
			if(!this.merged)return;
			var table = this.tableBody.children[0], tbody = table.tBodies[0], cell;
			table.className = table.className.replace(/[ ]?datagrid\-row\d+\-selected/gi,'');
			for(var i=0; i<tbody.rows.length; i++){
				for(var j=0; j<tbody.rows[i].cells.length; j++){
					cell = tbody.rows[i].cells[j];
					cell.className = cell.className.replace(' datagrid-cell-merged','').replace(/[ ]?datagrid\-row\d+/gi, '');
					$(cell).unbind('.merged').removeAttr('rowspan');
				}
			}
			this.merged = false;
		},
		_hideColumn: function(fields){
			var _this = this, opts = _this.options, fields = typeof fields == 'string'?fields.split(','):fields;
			for(var i=0; i<fields.length; i++){
				$('td.datagrid-cell[field="' + fields[i] + '"]', this.tableBody).each(function(){
					this.style.display = 'none';
					var fieldOpts = _datagridMethods._getColumnOption.call(_this, fields[i]);
					fieldOpts.hidden = true;
					fieldOpts.style += 'display:none;';
				});
				_this.hasFitColumn = _datagridMethods._getColumnFields.call(_this, {checkbox:false, width:false, hidden:false}).length > 0;
				if(!_this.hasFitColumn)$('.datagrid-cell-extend', this.tableBody).removeAttr('style');
				if(opts.total == 0)$('.datagrid-body > .datagrid-row-empty > .datagrid-cell:not(.datagrid-td-rownumber)', _this.tableBody).attr('colspan', _datagridMethods._getColumnFields.call(_this, {hidden:false}).length + 1);
			}
		},
		_showColumn: function(fields){
			var _this = this, opts = _this.options, fields = typeof fields == 'string'?fields.split(','):fields;
			for(var i=0; i<fields.length; i++){
				$('td.datagrid-cell[field="' + fields[i] + '"]', this.tableBody).each(function(){
					this.style.display = 'table-cell';
					var fieldOpts = _datagridMethods._getColumnOption.call(_this, fields[i]);
					fieldOpts.hidden = false;
					fieldOpts.style =  fieldOpts.style.replace('display:none;', '');
					if(fieldOpts.width && fieldOpts.width != 'auto')$(this).siblings('.datagrid-cell-extend')
				});
				_this.hasFitColumn = _datagridMethods._getColumnFields.call(_this, {checkbox:false, width:false, hidden:false}).length > 0;
				if(_this.hasFitColumn)$('.datagrid-cell-extend', this.tableBody).css({width:0});
				if(opts.total == 0)$('.datagrid-body > .datagrid-row-empty > .datagrid-cell:not(.datagrid-td-rownumber)', _this.tableBody).attr('colspan', _datagridMethods._getColumnFields.call(_this, {hidden:false}).length + 1);
			}
		}
	};
	$.fn.datagrid = function(){
        var method = arguments[0];
        if($.fn.datagrid.methods[method]) {
            method = $.fn.datagrid.methods[method];
			Array.prototype.splice.call(arguments, 0, 1, this);
        	return method.apply(this, arguments);
        } else if( typeof(method) == 'object' || !method ) {
            return _datagridMethods._init.apply(this, arguments);;
        } else {
            $.error( 'Method "' +  method + '" does not exist on jQuery.peraDatagrid' );
            return this;
        }
	}
	$.fn.datagrid.methods = {
		options: function(jq){
			return jq[0].options;
		},
		getPager: function(jq){
			return $(jq[0].pagination);
		},
		getPanel: function(jq){
			return $(jq[0].tableBody);
		},
		getColumnFields: function(jq, frozen){
			return _datagridMethods._getColumnFields.call(jq[0], forzen);
		},
		getColumnOption: function(jq, field){
			return _datagridMethods._getColumnOption.call(jq[0], field);
		},
		resize: function(jq, param){
			return jq.each(function(){
				if(this.options.fit)return;
				_datagridMethods._resize.call(this, param);
			});
		},
		load: function(jq, param){
			return jq.each(function(){
				_datagridMethods._load.call(this, param);
			});
		},
		reload: function(jq, param){
			return jq.each(function(){
				_datagridMethods._reload.call(this, param);
			});
		},
//		reloadFooter: function(jq, footer){},
		loading: function(jq){
			return jq.each(function(){
				_datagridMethods._loading.call(this);
			});
		},
		loaded: function(jq){
			return jq.each(function(){
				_datagridMethods._loaded.call(this);
			});
		},
//		fitColumns: function(jq){},
//		fixColumnSize: function(jq, field){},
//		fixRowHeight: function(jq, index){},
//		freezeRow: function(jq, index){},
//		autoSizeColumn: function(jq, field){},
		loadData: function(jq, data){
			return jq.each(function(){
				_datagridMethods._loadData.call(this, data);
			});
		},
		getData: function(jq){
			return jq[0].options.data;
		},
		getRows: function(jq){
			return _datagridMethods._getRows.call(jq[0]);
		},
//		getFooterRows: function(jq){},
		getRowIndex: function(jq, row){
			return _datagridMethods._getRowIndex.call(jq[0], row);
		},
		getChecked: function(jq){
			return _datagridMethods._getChecked.call(jq[0]);
		},
		getSelected: function(jq){
			return _datagridMethods._getSelected.call(jq[0]);
		},
		getSelections: function(jq){
			return _datagridMethods._getSelections.call(jq[0], 'data');
		},
		clearSelections: function(jq){
			return jq.each(function(){
				_datagridMethods._clearSelections.call(this);
			});
		},
		clearChecked: function(jq){
			return jq.each(function(){
				_datagridMethods._clearChecked.call(this);
			});
		},
//		scrollTo: function(jq, index){},
//		highlightRow: function(jq, index){},
		selectAll: function(jq){
			return jq.each(function(){
				_datagridMethods._selectAll.call(this);
			});
		},
		unselectAll: function(jq){
			return jq.each(function(){
				_datagridMethods._unselectAll.call(this);
			});
		},
		selectRow: function(jq, index){
			return jq.each(function(){
				_datagridMethods._selectRow.call(this, index);
			});
		},
		selectRecord: function(jq, idValue){
			return jq.each(function(){
				_datagridMethods._selectRecord.call(this, idValue);
			});
		},
		unselectRow: function(jq, index){
			return jq.each(function(){
				_datagridMethods._unselectRow.call(this, index);
			});
		},
		checkAll: function(jq){
			return jq.each(function(){
				_datagridMethods._checkAll.call(this);
			});
		},
		uncheckAll: function(jq){
			return jq.each(function(){
				_datagridMethods._uncheckAll.call(this);
			});
		},
		checkRow: function(jq, index){
			return jq.each(function(){
				_datagridMethods._checkRow.call(this, index);
			});
		},
		uncheckRow: function(jq, index){
			return jq.each(function(){
				_datagridMethods._uncheckRow.call(this, index);
			});
		},
		beginEdit: function(jq, index){
			return jq.each(function(){
				_datagridMethods._beginEdit.call(this, index);
			});
		},
		endEdit: function(jq, index){
			return jq.each(function(){
				_datagridMethods._endEdit.call(this, index);
			});
		},
		cancelEdit: function(jq, index){
			return jq.each(function(){
				_datagridMethods._cancelEdit.call(this, index);
			});
		},
		getEditors: function(jq, index){
			return _datagridMethods._getEditors.call(jq[0]);
		},
		getEditor: function(jq, options){
			return _datagridMethods._getEditor.call(jq[0]);
		},
		refreshRow: function(jq, index){
			return jq.each(function(){
				_datagridMethods._refreshRow.call(this, index);
			});
		},
//		validateRow: function(jq, index){},
		updateRow: function(jq, param){
			return jq.each(function(){
				_datagridMethods._updateRow.call(this, param);
			});
		},
		appendRow: function(jq, row){
			return jq.each(function(){
				_datagridMethods._appendRow.call(this, row);
			});
		},
		insertRow: function(jq, param){
			return jq.each(function(){
				_datagridMethods._insertRow.call(this, param);
			});
		},
		prependRow: function(jq, row){
			return jq.each(function(){
				_datagridMethods._insertRow.call(this, {index:0, row:row});
			});
		},
		deleteRow: function(jq, index){
			return jq.each(function(){
				_datagridMethods._deleteRow.call(this, index);
			});
		},
		deleteSelections: function(jq){
			return jq.each(function(){
				_datagridMethods._deleteSelections.call(this);
			});
		},
//		getChanges: function(jq, type){},
//		acceptChanges: function(jq){},
//		rejectChanges: function(jq){},
		mergeCells: function(jq, options){
			return jq.each(function(){
				_datagridMethods._mergeCells.call(this, options);
			});
		},
		mergeCellsByField: function(jq, fields){
			return jq.each(function(){
				_datagridMethods._mergeCellsByField.call(this, fields);
			});
		},
		breakCells: function(jq){
			return jq.each(function(){
				_datagridMethods._breakCells.call(this);
			});
		},
		hideColumn: function(jq, fields){
			return jq.each(function(){
				_datagridMethods._hideColumn.call(this, fields);
			});
		},
		showColumn: function(jq, fields){
			return jq.each(function(){
				_datagridMethods._showColumn.call(this, fields);
			});
		}
	};
	$.fn.datagrid.defaults = {
		columns: undefined,
		frozenColumns: undefined,
		fitColumns: false,
		resizeHandle: 'right',
		autoRowHeight: true,
		toolbar: null,
		striped: false,
        method: 'post',
		nowrap: true,
		url: null,
		total: 0,
		data: [],
		totalrow: {totalrow:true},
		showLoading: true,
		loadMsg: decodeURI('&#x52A0;&#x8F7D;&#x4E2D;&#xFF0C;&#x8BF7;&#x7A0D;&#x7B49;......'),
		emptyMsg: decodeURI('\u6ca1\u6709\u6570\u636e \uff01\uff01\uff01'),
		pagination: false,
		rownumbers: false,
		singleSelect: false,
		checkOnSelect: true,
		selectOnCheck: true,
		pagePosition: 'bottom',
		pagePointer: 0,
		pageNumber: 1,
		pageSize: 10,
		pageList: [10,20,30,50],
		queryParams: {},
		sortName: null,
		sortOrder: 'asc',
		multiSort: false,
		remoteSort: true,
		showHeader: true,
		showFooter: false,
		scrollbarSize: 18,
		rowStyler: null,
		rowOverColor: '#FAF3E1',
		rowSelectedColor: '#FBEBBF',
        loader: function(param, successFn, error){
            var _this = this, opts = this.options;
            if (!opts.url)return false;
            $.ajax({
                type: opts.method,
                url: opts.url,
                data: param,
                dataType: "json",
                success: function(data){
                	data = opts.loadFilter.call(_this, data);
					opts.pagePointer = 0;
					if(!opts.pagination){
						if(data.total > data.rows.length){
							for(var i=0,j=data.total-data.rows.length; i<j; i++){
								data.rows.push({});
							}
						}
					}else{
						if(data.total >= opts.pageSize && data.rows.length < opts.pageSize){
							for(var i=0,j=opts.pageSize-data.rows.length; i<j; i++){
								data.rows.push({});
							}
						}
					}
					if(data.total < data.rows.length)data.rows.splice(data.total, data.rows.length - data.total);
                    successFn.call(_this, data);
                },
                error: function(){
					if(error)error.apply(_this, arguments);
                }
            });
        },
        loadFilter: function(data){
			data = data?data:[];
            if(typeof data.length == "number" && typeof data.splice == "function"){
                return {
                    total : data.length,
                    rows : data,
                    attachData : data.attachData
                };
            }else{
                return data;
            }
        },
		idField: 'id',
		editors: {
			defaults: {
				valueField: 'value',
				textField: 'text',
				editable: true,
				onFocus: null,
				onBlur: null
			},
			intercept: {},
			init: function(cell, options){
				options = $.extend(true, {}, this.defaults, options);
				var tdInner = $(cell).find('.datagrid-cell-inner')[0];
				var ipt = $('<input type="text" class="datagrid-editable-input" autocomplete="off" />').attr('value', cell.editor.oldValue).val(cell.editor.oldValue).prop('etype', cell.editor.type).prop('readonly', !options.editable).prop('disabled', options.disabled).appendTo(tdInner?tdInner:cell);
				ipt.attr('style', (options.hidden?'display:none;':'') + (options.align?('text-align:' + options.align + ';'):''));// + ('width:' + (options.width?options.width:($(cell).width() - 4)) + 'px;')
				ipt.unbind().click(function(e){e.stopPropagation();}).focus(options.onFocus).blur(options.onBlur);
				if(cell.editor.type == 'validatebox' || options.required){
					ipt.validatebox(options).validatebox('validate');
				}
				if(cell.editor.type == 'datebox' || cell.editor.type == 'datetimebox' || cell.editor.type == 'combobox' || cell.editor.type == 'combotree'){
					if(options.data){
						for(var i=0; i<options.data.length; i++){
							if(ipt.val() == options.data[i][options.textField]){
								ipt.attr('value', options.data[i][options.valueField]);
								break;
							}
						}
					}else{
						ipt.attr('value', ipt.val());
					}
					if(ipt.is('.validatebox-invalid'))ipt.css({backgroundPosition:ipt.width() - 32 + 'px center'});
					var btn = $('<span class="combo-arrow combo-btn"></span>').prop('etype', cell.editor.type).mouseover(function(){$(this).addClass('combo-btn-hover');}).mouseout(function(){$(this).removeClass('combo-btn-hover');}).click(function(e){
						$(this).prev('.ico').remove();
						$(this).remove();
						ipt[this.etype](options)
						ipt[this.etype]('showPanel');
						e.stopPropagation();
					}).appendTo(tdInner?tdInner:cell);
					if(!this.intercept.getValue){
						var _this = this;
						_this.intercept.getValue = $.fn.combo.methods.getValue;
						$.fn.combo.methods.getValue = function(sender){
							return _this.getValue(sender);
						}
					}
					if(!this.intercept.setValue){
						var _this = this;
						_this.intercept.setValue = $.fn.combo.methods.setValue;
						$.fn.combo.methods.setValue = function(sender, value){
							return _this.setValue(sender, value);
						}
					}
				}
				return ipt[0];
			},
			destroy: function(cell){
				cell.className = cell.className.replace(' datagrid-editable ' + cell.editor.type, '');
				if($(cell.editor.target).is('.' + cell.editor.type + '-f')){
					$(cell.editor.target)[cell.editor.type]('destroy');
				}
				try{delete cell.editor;}catch(ex){cell.removeAttribute('editor');}
			},
			getValue: function(target){
				if($(target).is('.' + target.etype + '-f')){
					return $(target)[target.etype]('getValue');
				}else{
					return $(target).attr('value');
				}
			},
			setValue: function(target, value){
				if($(target).is('.' + target.etype + '-f')){
					return $(target)[target.etype]('setValue', value);
				}else{
					return $(target).attr('value', value);
				}
			}
		},
		view: null
	};
	/* extend method */
	$.extend({
		 parseOptionsToJOSN: function(strData){
			 var obj = {};
			 if(strData){
				 strData = strData.split(',');
				 for(var i=0; i<strData.length; i++){
					 var data = strData[i].split(':');
					 if(/^\d+$/.test(data[1])){obj[data[0]] = parseInt(data[1]);}
					 else if(/^\d+\.\d+$/.test(data[1])){obj[data[0]] = parseFloat(data[1]);}
					 else if(/^['"](.*)['"]$/.test(data[1])){obj[data[0]] = RegExp.$1;}
					 else if(/^true|false$/.test(data[1])){obj[data[0]] = data[1]=='true';}
				 }
			 }
			 return obj;
		 },
		 parseAttributeToJOSN: function(attrs){
			 var obj = {};
			 for(var i=0; i<attrs.length; i++){
				 if(attrs[i].nodeName=='id' || attrs[i].nodeName=='class' || attrs[i].nodeName=='data-options' || attrs[i].nodeValue == null || attrs[i].nodeValue == '')continue;
				 if(/^\d+$/.test(attrs[i].nodeValue)){obj[attrs[i].nodeName.toLowerCase()] = parseInt(attrs[i].nodeValue);}
				 else if(/^\d+\.\d+$/.test(attrs[i].nodeValue)){obj[attrs[i].nodeName.toLowerCase()] = parseFloat(attrs[i].nodeValue);}
				 else if(/^true|false$/.test(attrs[i].nodeValue)){obj[attrs[i].nodeName.toLowerCase()] = attrs[i].nodeValue=='true';}
				 else {obj[attrs[i].nodeName.toLowerCase()] = attrs[i].nodeValue;}
			 }
			 return obj;
		 },
		 parseLength: function(str){
			 if(str==null)return 0;
			 var len = 0;
			 str = str.toString().replace(/<[^>]*>/ig,'');
			 for(var i=0; i<str.length; i++){
				 if(/\w+/.test(str.charAt(i)))
				 	len++;
				 else
				 	len += 2;
			 }
			 return len;
		 }
	});
})(jQuery);