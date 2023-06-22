const fs = require("fs");
const ExcelJS = require("exceljs");
//--------get worksheet
const workbook = new ExcelJS.Workbook();
workbook.xlsx.readFile("BangCong.xlsx").then(() => {
  const worksheet = workbook.getWorksheet("Chấm công");
  //--------function return array of charater excel column
  function excelColumns(end) {
    const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let columns = allLetters.split("");
    for (let i = 0; i < allLetters.length; i++) {
      for (let j = 0; j < allLetters.length; j++) {
        columns.push(allLetters[i].concat(allLetters[j]));
        if (allLetters[i] == end[0] && allLetters[j] == end[1]) {
          return columns;
        }
      }
    }
  }
  const columns = excelColumns("EH");
  //--------get all rows(if needed)
  let rows = worksheet.rowCount;
  //--------get all value of row4 for get all of days, row4[0] = empty
  let row4 = worksheet.getRow(4).values;
  row4.shift();
  //--------get all value of row6 for get all of shift, row6[0] = empty
  let row6 = worksheet.getRow(6).values;
  row6.shift();
  //--------find starting index and ending index to loop (for j) through days (1=>31)
  let startLoopJ = row4.findIndex((element) => element == 1);
  let endLoopJ = row4.findLastIndex((element) => element == 31);
  //--------declare detailData as the final result which includes all staff
  let detailData = [];
  //--------Start loop in data excel file and push data to detailData
  // for i: loop to push staff name
  for (let i = 7; i <= 10; i++) {
    // declare detailPerStaff as the data of each staff
    let detailPerStaff = {
      staffName: worksheet.getCell(`${columns[2]}${i}`).value,
      detailPerDay: [],
    };
    // for j: loop to push data of each day j<=endLoopJ
    for (j = startLoopJ; j <= endLoopJ; j++) {
      let detail1Day = {
        day: worksheet.getCell(`${columns[j]}${4}`).value,
        totalTime: 0,
        earn: 0,
      };
      // count number of merged columns (1 day merge many shift)
      let mergeCount = worksheet.getCell(`${columns[j]}${4}`)._mergeCount;
      // loop with number of merged columns to get all shifts and all values of each shift
      for (let k = 0; k <= mergeCount; k++) {
        //get which shift is targetted
        let shift = worksheet.getCell(`${columns[j + k]}${6}`).value;
        //get which value of shift is targetted, if null return 0
        let timeOnShift = worksheet.getCell(`${columns[j + k]}${i + k}`).value
          ? worksheet.getCell(`${columns[j + k]}${i + k}`).value
          : 0;
        //get price per hour of each shift of each staff, indexOfSumShift => indexOf$
        let indexOfSumShift = row6.findIndex((element) => element === shift);
        // get pricePerShift if pricePerShift=undefined return 0
        let pricePerShift;
        if (
          worksheet.getCell(`${columns[indexOfSumShift]}${6}`).value === "WK-D"
        ) {
          pricePerShift = worksheet.getCell(
            `${columns[indexOfSumShift + 2]}${i}`
          ).value?.result
            ? worksheet.getCell(`${columns[indexOfSumShift + 2]}${i}`).value
                ?.result
            : 0;
        } else {
          pricePerShift = worksheet.getCell(
            `${columns[indexOfSumShift + 1]}${i}`
          ).value?.result
            ? worksheet.getCell(`${columns[indexOfSumShift + 1]}${i}`).value
                ?.result
            : 0;
        }
        // push data to detail1Day
        detail1Day[shift] = timeOnShift;
        detail1Day.totalTime += timeOnShift;
        detail1Day.earn += timeOnShift * pricePerShift;
      }
      // push data 1 day to detail per staff
      detailPerStaff.detailPerDay.push(detail1Day);
      //j+mergeCount to go to the next day
      j = j + mergeCount;
    }
    detailData.push(detailPerStaff);
  }
  //--------push final result to a text file
  let finalData = JSON.stringify(detailData);
  fs.appendFileSync("result.txt", "");
  fs.writeFileSync("./result.txt", finalData);
  const newData = fs.readFileSync("./result.txt", {
    encoding: "utf8",
    flag: "r",
  });
});
