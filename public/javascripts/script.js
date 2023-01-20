function screen(filimId){
    $.ajax({
        url:'adminT/add-to-screen/'+filimId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#filim-count').html()
                count=parseInt(count)+1
                $("#filim-count").html(count)
            }
           
        }
    })
}
