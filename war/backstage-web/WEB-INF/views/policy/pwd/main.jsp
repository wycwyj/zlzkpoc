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
    <title>密码规则管理主界面</title>
</head>
<body>
<wood-lay:operate-conditions values="${pageConditions.conditions}"
                             queryUrl="/pwdrule/wood/be/operate/pageList"
                             inputUrl="/pwdrule/wood/page/pwd/input"
                             delUrl="/pwdrule/wood/be/operate/del"
                             tableId="pwdRuleDataTable"
                             basicEntity="true"
                             dataTable="${pageConditions.table}"
                             buttons="[{title:'新增',click:'add()',icon:'&#xe654;'},{title:'编辑',click:'edit()',icon:'&#xe642;'},{title:'删除',click:'del()',icon:'&#xe640;'}]"
                             rowOperateExtends="{fixed:'right',title:'操作',toolbar:'#rowOpTemplate',width:150}"
                             rowOperateButtons="{scriptId:'rowOpTemplate',rowButtons:[{styleClass:'layui-btn layui-btn-xs',text:'编辑',click:'rowEdit'},{styleClass:'layui-btn layui-btn-danger layui-btn-xs',text:'删除',click:'rowDel'}]}"
                             checkBoxField="id"
                             needNO="true"/>

<script type="text/html" id="createTimeT">
    {{ dateTimeFormat(d.createTime) }}
</script>
<script type="text/html" id="isOkT">
    <input type="checkbox" name="isOk" value="{{d.isOk}}" lay-skin="switch" lay-text="有效|无效" lay-filter="isOkFilter" disabled {{d.isOk=='有效'?'checked':''}}>
</script>
<script type="text/html" id="isUsedT">
    <input type="checkbox" name="isUsed" value="{{d.isUsed}}" lay-skin="switch" lay-text="是|否" lay-filter="isUsedFilter" disabled {{d.isUsed=='on'?'checked':''}}>
</script>
<script>
    var $width = ($(".layui-container").width()-50)+"px";
    var $height = ($(".layui-container").height()-50)+"px";

    function add(){
        windowOpener.openWindow({title:'添加规则',maxmin:false,width:$width,height:$height});
    }

    function edit(){
        tableObject.go2Edit({title:'修改规则',maxmin:false,width:$width,height:$height});
    }

    function del(){
        tableObject.delObjs();
    }

    function rowEdit(data){
        tableObject.go2Edit({title:'修改规则',maxmin:false,width:$width,height:$height,data:data});
    }

    function rowDel(data){
        tableObject.delObj(data);
    }
</script>
</body>
</html>