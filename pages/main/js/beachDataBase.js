const GOOGLE_SPREAD_SHEETS_KEY = '1E7hpYjYFQbxtb6emM3DgdwabrJzwE82_MtY0bzyLUe0';

google.charts.load('current', { packages: ['corechart'] }).then(() => {
  let query = new google.visualization.Query(
    `http://spreadsheets.google.com/tq?key=${GOOGLE_SPREAD_SHEETS_KEY}&pub=1`,
  );
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

    let dataTable = response.getDataTable().toJSON();
    let jsonData = JSON.parse(dataTable);
    let cols = jsonData.cols.map(col => col.label);
    let rows = jsonData.rows.map(row => {
      let newRow;

      row.c.forEach((obj, index) => {
        if (obj == null || obj == undefined) return;
        obj[cols[index]] = 'f' in obj ? obj['f'] : obj['v'];
        ['f', 'v'].forEach(each => delete obj[each]);
        newRow = { ...newRow, ...obj };
      });
      return newRow;
    });
    console.log(rows);
    return rows;
  });
});
