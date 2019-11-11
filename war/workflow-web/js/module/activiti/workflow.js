function graphTrace(ctx,pid,pdid,options) {

    var _defaults = {
        srcEle: this,
        pid: ''+pid+'',
	    pdid: ''+pdid+''
    };
    var opts = $.extend(true, _defaults, options);

    // 处理使用js跟踪当前节点坐标错乱问题
    $('#changeImg').live('click', function() {
        $('#workflowTraceDialog').dialog('close');
        if ($('#imgDialog').length > 0) {
            $('#imgDialog').remove();
        }
        $('<div/>', {
            'id': 'imgDialog',
            title: '此对话框显示的图片是由引擎自动生成的，并用红色标记当前的节点<button id="diagram-viewer">Diagram-Viewer</button>',
            html: "<img src='" + ctx + '/process/trace/auto/' + opts.pid + "' />"
        }).appendTo('body').dialog({
            modal: true,
            resizable: false,
            dragable: false,
            width: document.documentElement.clientWidth * 0.95,
            height: document.documentElement.clientHeight * 0.95
        });
    });

	/*
	用官方开发的Diagram-Viewer跟踪
	 */
	$('#diagram-viewer').live('click', function() {
		$('#workflowTraceDialog').dialog('close');

		if ($('#imgDialog').length > 0) {
			$('#imgDialog').remove();
		}

		var url = ctx + '/diagram-viewer/index.html?processDefinitionId=' + opts.pdid + '&processInstanceId=' + opts.pid;

		$('<div/>', {
			'id': 'imgDialog',
			title: '此对话框显示的图片是由引擎自动生成的，并用红色标记当前的节点',
			html: '<iframe src="' + url + '" width="100%" height="' + document.documentElement.clientHeight * 0.90 + '" />'
		}).appendTo('body').dialog({
			modal: true,
			resizable: false,
			dragable: false,
			width: document.documentElement.clientWidth * 0.95,
			height: document.documentElement.clientHeight * 0.95
		});
	});

    // 获取图片资源
    var imageUrl = ctx + "/process/resource/process-instance?pid=" + opts.pid + "&type=image";
    $.getJSON(ctx + '/process/trace?pid=' + opts.pid, function(infos) {

        var positionHtml = "";

        // 生成图片
        var varsArray = new Array();
        $.each(infos, function(i, v) {
            var $positionDiv = $('<div/>', {
                'class': 'activity-attr'
            }).css({
                position: 'absolute',
                left: (v.x - 1),
                top: (v.y - 1),
                width: (v.width - 2),
                height: (v.height - 2),
                backgroundColor: 'black',
                opacity: 0,
                zIndex: $.fn.qtip.zindex - 1
            });

            // 节点边框
            var $border = $('<div/>', {
                'class': 'activity-attr-border'
            }).css({
                position: 'absolute',
                left: (v.x - 1),
                top: (v.y - 1),
                width: (v.width - 4),
                height: (v.height - 3),
                zIndex: $.fn.qtip.zindex - 2
            });

            if (v.currentActiviti) {
                $border.addClass('ui-corner-all-12').css({
                    border: '3px solid red'
                });
            }
            positionHtml += $positionDiv.outerHTML + $border.outerHTML;
            varsArray[varsArray.length] = v.vars;
        });

        if ($('#workflowTraceDialog').length == 0) {
            $('<div/>', {
                id: 'workflowTraceDialog',
                title: '查看流程（按ESC键可以关闭）<button id="changeImg">如果坐标错乱请点击这里</button><button id="diagram-viewer">Diagram-Viewer</button>',
                html: "<div><img src='" + imageUrl + "' style='position:absolute; left:0px; top:0px;' />" +
                "<div id='processImageBorder'>" +
                positionHtml +
                "</div>" +
                "</div>"
            }).appendTo('body');
        } else {
            $('#workflowTraceDialog img').attr('src', imageUrl);
            $('#workflowTraceDialog #processImageBorder').html(positionHtml);
        }

        // 设置每个节点的data
        $('#workflowTraceDialog .activity-attr').each(function(i, v) {
            $(this).data('vars', varsArray[i]);
        });

        

    });
}
