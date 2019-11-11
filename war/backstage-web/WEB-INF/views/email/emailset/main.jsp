<%@ taglib prefix="wood-lay" uri="http://www.ztj.com/tags/Wood-LayUI" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <%@include file="/common/jsp/wood.main.resources.jsp"%>
    <style type="text/css">
        .layui-container {
            padding: 0px 0px;
            height: 100%;
        }
        .selectLs {
            width: 100%;
        }
    </style>
    <title>邮件内容设置主界面</title>
</head>
<body>
<wood-lay:operate-conditions values="${pageConditions.conditions}"
                             queryUrl="/emailset/wood/be/operate/pageList"
                             inputUrl="/emailset/wood/page/emailset/input"
                             delUrl="/emailset/wood/be/operate/del"
                             tableId="emailSetDataTable"
                             basicEntity="true"
                             dataTable="${pageConditions.table}"
                             buttons="[{title:'新增',click:'add()',icon:'&#xe654;'},{title:'编辑',click:'edit()',icon:'&#xe642;'},{title:'删除',click:'del()',icon:'&#xe640;'}]"
                             rowOperateExtends="{fixed:'right',title:'操作',toolbar:'#rowOpTemplate',width:150}"
                             rowOperateButtons="{scriptId:'rowOpTemplate',rowButtons:[{styleClass:'layui-btn layui-btn-xs',text:'编辑',click:'rowEdit'},{styleClass:'layui-btn layui-btn-danger layui-btn-xs',text:'删除',click:'rowDel'}]}"
                             checkBoxField="id"
                             needNO="true"/>
<script type="text/html" id="createTimeT">
    {{ dateFormat(d.createdate) }}
</script>
<script type="text/html" id="isUsedT">
    <input type="checkbox" name="attr1" value="{{d.attr1}}" lay-skin="switch" lay-text="是|否" lay-filter="isUsedFilter" disabled {{d.attr1=='on'?'checked':''}}>
</script>
<script>
    var $width = ($(".layui-container").width()-50)+"px";
    var $height = ($(".layui-container").height()-50)+"px";

    function add(){
        windowOpener.openWindow({title:'添加邮件内容设置',maxmin:false,width:$width,height:$height});
    }

    function edit(){
        tableObject.go2Edit({title:'修改邮件内容设置',maxmin:false,width:$width,height:$height});
    }

    function del(){
        tableObject.delObjs();
    }

    function rowEdit(data){
        tableObject.go2Edit({title:'修改邮件内容设置',maxmin:false,width:$width,height:$height,data:data});
    }

    function rowDel(data){
        tableObject.delObj(data);
    }
</script>
</body>
</html>