$(document).ready(function(){
    $('.accord').click(function(){
        var menu = $(this).attr("href");
        $(menu).slideToggle();
    })
    
    $('.btn-tab-toggle').click(function(){
        var menu=$(this).attr("href");
        $("."+menu).slideToggle("fast");
        $(menu+" .linkmore").toggle(180);
        if ($("."+menu).height() > 20) {
            $(this).css({
                "-webkit-transform" : "rotate(180deg)",
                "-moz-transform" : "rotate(180deg)",
                "transform" : "rotate(180deg)"
            })
            $('#'+menu).hide();
        }else if($("."+menu).height() < 20){
            $(this).css({
                "-webkit-transform" : "rotate(0deg)",
                "-moz-transform" : "rotate(0deg)",
                "transform" : "rotate(0deg)"
            })
        }
    });

    // $('.option-click').click(function(){
    //     var menu=$(this).attr("href");
    //     $(menu).toggle();
    //     $(".option-menu").not($(menu)).hide();
    // });

    //selectall function
    $('#selectall').click(function(event) {
        if(this.checked) {
            $('.select').each(function() {
                this.checked = true;
            });
        }else{
            $('.select').each(function() {
                this.checked = false;
            });
        }
    });

    $('#count-checked :checkbox').change(function(){
        var checkedbox = $("#count-checked .cnt-chk:checkbox:checked").length
        if (checkedbox == 0) {
            $('.valchecked').html('');
        }else if(checkedbox == 1){
            $('.valchecked').html(checkedbox+" Records Selected <button class='btn-list-control' onclick='deletecheck()' style='background-image:url(http://survey.kadence.co.id:8000/images/icon/delete-thrash.png); background-position:center; background-size:25px 25px; background-repeat:no-repeat;'>&nbsp;</button>&nbsp;<button class='btn-list-control' style='background-image:url(http://survey.kadence.co.id:8000/images/icon/eye-view.png); background-position:center; background-size:25px 25px; background-repeat:no-repeat;'>&nbsp;</button>");
        }else if(checkedbox > 1){
            $('.valchecked').html(checkedbox+" Records Selected <button class='btn-list-control' onclick='deletecheck()' style='background-image:url(http://survey.kadence.co.id:8000/images/icon/delete-thrash.png); background-position:center; background-size:25px 25px; background-repeat:no-repeat;'>&nbsp;</button>");
        }
    });


    $(window).resize(function(){
        $('.selectorline').css({
            "width" : $('.thistab').width()+50 +"px"
        })
        $('.gridcontent').css({
            "width" : 100/$('.gridcontent').length +"%"
        })
        for(var i=1;i<=$('.gridcontent').length;i++){
            $('.tabgridcontent div:nth-child('+i+')').css({
                "transform" : 'translateX('+ i-1*100 +"%)"
            })                
        }
        $('.tabgridcontent').css({
            "width" : $('.gridcontent').length*100 +"%"
        })
    }).resize();

    $(".tabgrid ul li").click(function(){
        var clickID = $(this).attr('data'); //diambil dari data yang di klik
        var target = $(this).data('target'); //diambil dari data-target yang di klik
        var dataTarget = $('#'+clickID).attr("data");// dari class gridcontent data=""
        var linewidth = $(this).width()+50
        var position = 0;
        var transform = "-"+target * 100

        for(var i=0;i<$(this).data('target');i++){
            var nth = i+1
            var linewidth2 = $('.tabgrid ul li:nth-child('+ nth +')').width()+50
            position += linewidth2
        }

        $('.selectorline').animate({
            "left" : position +"px",
            "width" : linewidth +"px"
        })
        
        $('.gridcontent').css({
           "transform" : "translateX("+transform+"%) translateY(0)"
        })
    })
})

function closePopup(){
    $(".popup").fadeOut();
    $('.blur').fadeOut();
}

function clickToggle(target){
    $(target).toggle();
    $(".option-menu").not($(target)).hide();
}