/**
 * jQuery EasyUI 1.3.2
 * 
 *翻译： qq  1364386878 下拉树
 */
(function ($) {
    //设置大小
    function setSize(jq) {
        var options = $.data(jq, "combotree").options;
        var combotree = $.data(jq, "combotree").tree;
        $(jq).addClass("combotree-f");
        $(jq).combo(options);
        var panel = $(jq).combo("panel");
        if (!combotree) {
            combotree = $("<ul></ul>").appendTo(panel);
            $.data(jq, "combotree").tree = combotree;
        }
        combotree.tree($.extend({},
            options, {
            checkbox: options.multiple,
            onLoadSuccess: function (node, data) {
                var values = $(jq).combotree("getValues");
                if (options.multiple) {
                    var checkedNodes = combotree.tree("getChecked");
                    for (var i = 0; i < checkedNodes.length; i++) {
                        var id = checkedNodes[i].id;
                        (function () {
                            for (var i = 0; i < values.length; i++) {
                                if (id == values[i]) {
                                    return;
                                }
                            }
                            values.push(id);
                        })();
                    }
                }
                $(jq).combotree("setValues", values);
                options.onLoadSuccess.call(this, node, data);
            },
            onClick: function (node) {
                select(jq);
                $(jq).combo("hidePanel");
                options.onClick.call(this, node);
            },
            onCheck: function (node, node) {
                select(jq);
                options.onCheck.call(this, node, node);
            }
        }));
    };
    //选择
    function select(jq) {
        var options = $.data(jq, "combotree").options;
        var combotree = $.data(jq, "combotree").tree;
        var vv = [], ss = [];
        if (options.multiple) {
            var checkedNode = combotree.tree("getChecked");
            for (var i = 0; i < checkedNode.length; i++) {
                vv.push(checkedNode[i].id);
                ss.push(checkedNode[i].text);
            }
        } else {
            var checkedNode = combotree.tree("getSelected");
            if (checkedNode) {
                vv.push(checkedNode.id);
                ss.push(checkedNode.text);
            }
        }
        $(jq).combo("setValues", vv).combo("setText", ss.join(options.separator));
    };
    //设置数组值
    function setValues(jq, values) {
        var options = $.data(jq, "combotree").options;
        var combotree = $.data(jq, "combotree").tree;
        combotree.find("span.tree-checkbox").addClass("tree-checkbox0").removeClass("tree-checkbox1 tree-checkbox2");
        var vv = [], ss = [];
        for (var i = 0; i < values.length; i++) {
            var v = values[i];
            var s = v;
            var node = combotree.tree("find", v);
            if (node) {
                s = node.text;
                combotree.tree("check", node.target);
                combotree.tree("select", node.target);
            }
            vv.push(v);
            ss.push(s);
        }
        $(jq).combo("setValues", vv).combo("setText", ss.join(options.separator));
    };
    //实例化下拉树
    $.fn.combotree = function (target, parm) {
        if (typeof target == "string") {
            var method = $.fn.combotree.methods[target];
            if (method) {
                return method(this, parm);
            } else {
                return this.combo(target, parm);
            }
        }
        target = target || {};
        return this.each(function () {
            var combotree = $.data(this, "combotree");
            if (combotree) {
                $.extend(combotree.options, target);
            } else {
                $.data(this, "combotree", {
                    options: $.extend({},
                        $.fn.combotree.defaults,
                        $.fn.combotree.parseOptions(this),
                        target)
                });
            }
            setSize(this);
        });
    };
    //默认方法
    $.fn.combotree.methods = {
        //返回属性对象
        options: function (jq) {
            var options = $.data(jq[0], "combotree").options;
            options.originalValue = jq.combo("options").originalValue;
            return options;
        },
        //返回树形对象
        tree: function (jq) {
            return $.data(jq[0], "combotree").tree;
        },
        //读取本地树形数据
        loadData: function (jq, data) {
            return jq.each(function () {
                var options = $.data(this, "combotree").options;
                options.data = data;
                var tree = $.data(this, "combotree").tree;
                tree.tree("loadData", data);
            });
        },
        //再次请求远程树数据。通过'url'参数重写原始URL值
        reload: function (jq, url) {
            return jq.each(function () {
                var options = $.data(this, "combotree").options;
                var tree = $.data(this, "combotree").tree;
                if (url) {
                    options.url = url;
                }
                tree.tree({ url: options.url });
            });
        },
        //设置组件值数组
        setValues: function (jq, values) {
            return jq.each(function () {
                setValues(this, values);
            });
        },
        //设置组件值。
        setValue: function (jq, value) {
            return jq.each(function () {
                setValues(this, [value]);
            });
        },
        //清空控件的值
        clear: function (jq) {
            return jq.each(function () {
                var tree = $.data(this, "combotree").tree;
                tree.find("div.tree-node-selected").removeClass("tree-node-selected");
                var cc = tree.tree("getChecked");
                for (var i = 0; i < cc.length; i++) {
                    tree.tree("uncheck", cc[i].target);
                }
                $(this).combo("clear");
            });
        },
        //重置
        reset: function (jq) {
            return jq.each(function () {
                var options = $(this).combotree("options");
                if (options.multiple) {
                    $(this).combotree("setValues", options.originalValue);
                } else {
                    $(this).combotree("setValue", options.originalValue);
                }
            });
        }
    };
    //解析器
    $.fn.combotree.parseOptions = function (target) {
        return $.extend({}, $.fn.combo.parseOptions(target),
            $.fn.tree.parseOptions(target));
    };
    //默认属性、事件 继承comb和tree的
    $.fn.combotree.defaults = $.extend({},
        $.fn.combo.defaults,
        $.fn.tree.defaults,
        {
            //定义用户是否可以直接输入文本到字段中
            editable: false
        });
})(jQuery);