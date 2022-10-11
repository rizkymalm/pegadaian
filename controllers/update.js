require("../library/update")
require("../library/index")
exports.updateSkenarioByTask = async function(req,res){
    var skenario = await selectAllSkenario();
    var task = await selectAllTaskNotNull();
    var count = 0;
    var updated = []
    // console.log(task)
    for (let i = 0; i < task.length; i++) {
        var taskstatus = await getTaskStatusByArray(task[i].id)
        console.log('taskid', task[i].id);
        for (let x = 0; x < taskstatus.length; x++) {
            console.log('status', taskstatus[x].state)
            if(taskstatus[x].state === 200){
                var update = await updateSkenarioByidCabang(task[i].codecabang, task[i].skenario, task[i].status);
                if(update){
                    count++;
                    updated.push(task[i]);
                }
            }
        }
    }
    // for (let i = 0; i < skenario.length; i++) {
    //     var taskGadai = await getTaskByIdCabang(skenario[i].id_sub_branch, 'gadai');
    //     console.log(taskGadai)
        // if(taskGadai.length > 0){
        //     if(taskGadai[0].filename){
        //         var taskStatus = await checkStatus(taskGadai[0].id);
        //         if(taskStatus.length > 0 && taskStatus[0].state == 200){
        //             await updateSkenarioByidCabang(skenario[i].id_sub_branch, 'gadai', skenario[i].status);
        //         }
        //     }
        // }
        // var taskLunas = await getTaskByIdCabang(skenario[i].id_sub_branch, 'lunas');
        // if(taskLunas.length > 0){
        //     if(taskLunas[0].filename){
        //         var taskStatus = await checkStatus(taskLunas[0].id);
        //         if(taskStatus.length > 0 && taskStatus[0].state == 200){
        //             await updateSkenarioByidCabang(skenario[i].id_sub_branch, 'lunas', skenario[i].status);
        //         }
        //     }
        // }
        // var taskPhone = await getTaskByIdCabang(skenario[i].id_sub_branch, 'phone');
        // if(taskPhone.length > 0){
        //     if(taskPhone[0].filename){
        //         var taskStatus = await checkStatus(taskPhone[0].id);
        //         if(taskStatus.length > 0 && taskStatus[0].state == 200){
        //             await updateSkenarioByidCabang(skenario[i].id_sub_branch, 'phone', skenario[i].status);
        //         }
        //     }
        // }
    // }
    res.send(updated);
}

exports.updateExcelData = async function(req,res){
    var data = await excelData("IDD3039");
    const touchpont = ['satpam', 'penaksir', 'kasir', 'pengelolaagunan', 'ro', 'protokolkesehatan', 'kebersihan'];
    for (let i = 0; i < data.length; i++) {
        for (let x = 0; x < 7; x++) {
            // console.log(x+1)
            if(data[i][`S0B_O${x+1}`] !== -1){
                await updateTouchpont(data[i]['NAMA_CABANG'], touchpont[data[i][`S0B_O${x+1}`]-1])
            }
        }
    }
    res.send(data);
}

exports.updateCheck = async function(req,res){
    var task = await selectAllTask();
    var data = [];
    for (let i = 0; i < task.length; i++) {
        var taskstatus = await checkStatusByTask(task[i].id);
        if(taskstatus.length > 0){
            var counttask = 0
            for (let x = 0; x < taskstatus.length; x++) {
                if(taskstatus[x].state === 200){
                    counttask++
                }
            }
            if(counttask===0){
                data.push({
                    id: task[i].id,
                    count: counttask
                })
            }
        }else{
            console.log(task[i].id)
        }

    }
    res.send(data)
}