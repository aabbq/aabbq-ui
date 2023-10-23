import * as XLSX from "xlsx";

const getFileName = (name: string) => {
  let timeSpan = new Date().toISOString();
  let sheetName = name || "ExportResult";
  let fileName = `${sheetName}-${timeSpan}`;
  return {
    sheetName,
    fileName
  };
};
export class TableUtil {
  static exportTableToExcel(tableId: string, name: string, colId: number, colAction: number) {
    let { sheetName, fileName } = getFileName(name);
    let targetTableElm = document.getElementById(tableId);
    // let wb = XLSX.utils.table_to_book(targetTableElm, <XLSX.Table2SheetOpts>{
    //   sheet: sheetName
    // });
    
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTableElm);
    ws['!cols'] = [];
    ws['!cols'][colId] = { hidden: true };
    ws['!cols'][colAction] = { hidden: true };

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(ws, [['', 'Date', new Date().toLocaleString()]], {
      origin: -1, // Add to the end
    });
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static exportArrayToExcel(arr: any[], name: string) {
    let { sheetName, fileName } = getFileName(name);

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(arr);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static exportTableToExcelPI(tableId: string, name: string, colId: number, colAction: number) {
    let { sheetName, fileName } = getFileName(name);
    let targetTableElm = document.getElementById(tableId);
    // let wb = XLSX.utils.table_to_book(targetTableElm, <XLSX.Table2SheetOpts>{
    //   sheet: sheetName
    // });
    
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTableElm);
    ws['!cols'] = [];
    ws['!cols'][colId] = { hidden: true };
    ws['!cols'][1] = { hidden: true };
    ws['!cols'][2] = { hidden: true };
    ws['!cols'][colAction] = { hidden: true };

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(ws, [['', '', '', 'Date : ' + new Date().toLocaleString()]], {
      origin: -1, // Add to the end
    });
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static exportTableToExcelOrder(tableId: string, name: string, colId: number, colAction: number) {
    let { sheetName, fileName } = getFileName(name);
    let targetTableElm = document.getElementById(tableId);
    
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(targetTableElm);
    ws['!cols'] = [];
    ws['!cols'][colId] = { hidden: true };
    ws['!cols'][1] = { hidden: true };
    ws['!cols'][colAction] = { hidden: true };

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(ws, [['', '', 'Date : ' + new Date().toLocaleString()]], {
      origin: -1, // Add to the end
    });
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
}