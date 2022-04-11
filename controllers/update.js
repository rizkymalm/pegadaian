require("../library/update")
require("../library/index")
exports.updateSkenarioByTask = async function(req,res){
    var skenario = await selectAllSkenario();
    for (let i = 0; i < skenario.length; i++) {
        var taskGadai = await getTaskByIdCabang(skenario[i].id_sub_branch, 'gadai');
        if(taskGadai.length > 0){
            if(taskGadai[0].filename){
                var taskStatus = await checkStatus(taskGadai[0].id);
                if(taskStatus.length > 0 && taskStatus[0].state == 200){
                    await updateSkenarioByidCabang(skenario[i].id_sub_branch, 'gadai');
                }
            }
        }
        var taskLunas = await getTaskByIdCabang(skenario[i].id_sub_branch, 'lunas');
        if(taskLunas.length > 0){
            if(taskLunas[0].filename){
                var taskStatus = await checkStatus(taskLunas[0].id);
                if(taskStatus.length > 0 && taskStatus[0].state == 200){
                    await updateSkenarioByidCabang(skenario[i].id_sub_branch, 'lunas');
                }
            }
        }
        var taskPhone = await getTaskByIdCabang(skenario[i].id_sub_branch, 'phone');
        if(taskPhone.length > 0){
            if(taskPhone[0].filename){
                var taskStatus = await checkStatus(taskPhone[0].id);
                if(taskStatus.length > 0 && taskStatus[0].state == 200){
                    await updateSkenarioByidCabang(skenario[i].id_sub_branch, 'phone');
                }
            }
        }
    }
    res.send(skenario);
}