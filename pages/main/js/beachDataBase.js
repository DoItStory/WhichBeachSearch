const GOOGLE_SPREAD_SHEETS_KEY = '1E7hpYjYFQbxtb6emM3DgdwabrJzwE82_MtY0bzyLUe0';

export async function getBaechDataListArray() {
  return google.charts.load('current', { packages: ['corechart'] }).then(() => {
    let query = new google.visualization.Query(
      `http://spreadsheets.google.com/tq?key=${GOOGLE_SPREAD_SHEETS_KEY}&pub=1`,
      'auto',
    );
    return getSpreadSheetsDataList(query);
  });
}

async function getSpreadSheetsDataList(query) {
  return new Promise((resolve, reject) => {
    query.send(response => {
      if (response.isError()) {
        console.error(
          'Error in query: ' +
            response.getMessage() +
            ' ' +
            response.getDetailedMessage(),
        );
        return;
      }
      resolve(dataListParsing(response));
    });
  });
}

function dataListParsing(response) {
  let dataTable = response.getDataTable().toJSON();
  let jsonData = JSON.parse(dataTable);
  let cols = jsonData.cols.map(col => col.label);
  let rows = jsonData.rows.map(row => {
    let newRow;

    row.c.forEach((obj, index) => {
      if (obj == null || obj == undefined) return; //빈값이 경우 정지
      obj[cols[index]] = 'f' in obj ? obj['f'] : obj['v'];
      ['f', 'v'].forEach(each => delete obj[each]);
      newRow = { ...newRow, ...obj };
    });
    return newRow;
  });
  return rows;
}
