function resizeMe(offset){
    var isHidden = $(".bui-grid-tbar").css("display");
    if(isHidden=="none"){
        $(".bui-grid-tbar").remove();
    }
    var bodyHeight = $("body").height();
    var rowHeight = $(".row").height();
    var gridHeight = bodyHeight-rowHeight-10-(offset?offset:0);
    var gridTbarHeight = $(".bui-grid-tbar").height();
    var gridHeaderHeight = $(".bui-grid-header-container").height();
    var gridBbarHeight = $(".bui-grid-bbar").height();
    var gridBodyHeight = gridHeight-(gridTbarHeight+gridHeaderHeight+gridBbarHeight);
    $(".search-grid-container,#grid,.bui-grid").height(gridHeight);
    $(".bui-grid-body").height(gridBodyHeight);
    setTimeout(function () {
        $(".bui-grid-table tr:last > td").css("border-bottom","1px solid #ddd");
    },400);
    $(".bui-grid-bbar").css({"border-top":"none"});
}