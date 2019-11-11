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
    <title>安全策略管理主界面</title>
</head>
<body>
<wood-lay:operate-conditions values="${pageConditions.conditions}"
                             queryUrl="/safestrategy/wood/be/operate/pageList"
                             inputUrl="/safestrategy/wood/page/safestrategy/input"
                             delUrl="/safestrategy/wood/be/operate/del"
                             tableId="strategyDataTable"
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
    <input type="checkbox" name="isUsed" value="{{d.isUsed}}" lay-skin="switch" lay-text="是|否" lay-filter="isUsedFilter" disabled {{d.isUsed=='on'?'checked':''}}>
</script>

<script type="text/html" id="strictSaveT">
    <input type="checkbox" name="strictSave" value="{{d.strictSave}}" lay-skin="switch" lay-text="是|否" disabled {{d.strictSave=='on'?'checked':''}}>
</script>
<script>
    var $width = ($(".layui-container").width()-50)+"px";
    var $height = ($(".layui-container").height()-50)+"px";

    function add(){
        windowOpener.openWindow({title:'添加安全策略',maxmin:false,width:$width,height:$height});
    }

    function edit(){
        tableObject.go2Edit({title:'修改安全策略',maxmin:false,width:$width,height:$height});
    }

    function del(){
        tableObject.delObjs();
    }

    function rowEdit(data){
        tableObject.go2Edit({title:'修改安全策略',maxmin:false,width:$width,height:$height,data:data});
    }

    function rowDel(data){
        tableObject.delObj(data);
    }
</script>
</body>
</html>