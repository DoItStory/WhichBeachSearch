const GOOGLE_SPREAD_SHEETS_KEY = '1E7hpYjYFQbxtb6emM3DgdwabrJzwE82_MtY0bzyLUe0';

google.charts
  .load('current', { packages: ['corechart'] })
  .then(async function () {
    const query = new google.visualization.Query(
      `http://spreadsheets.google.com/tq?key=${GOOGLE_SPREAD_SHEETS_KEY}&pub=1`,
    );
    query.send(function (response) {
      let dataTable = response.getDataTable();
      let jsonData = dataTable.toJSON();
      jsonData = JSON.parse(jsonData);
      const beachData = jsonData.rows;
      const beachListData = parsingBeachList(beachData);
      console.log(beachListData);
    });
  });

function handleQueryResponse(response) {
  const dataTable = response.getDataTable();
  let jsonData = dataTable.toJSON();
  jsonData = JSON.parse(jsonData);
  const beachData = jsonData.rows;
  return parsingBeachList(beachData);
}

function parsingBeachList(beachDb) {
  const convertedData = [];
  for (let i = 0; i < 219; i++) {
    convertedData[i] = {
      beachCode: beachDb[i].c[0].v.toString(),
      beachName: beachDb[i].c[1].v,
      lon: beachDb[i].c[2].v.toString(),
      lat: beachDb[i].c[3].v.toString(),
      address: beachDb[i].c[4].v,
      landCode: beachDb[i].c[5].v,
      cityCode: beachDb[i].c[6].v,
      panoramaLink: beachDb[i].c[7].v,
      informationLink: beachDb[i].c[8].v,
    };
  }
  return convertedData;
}
