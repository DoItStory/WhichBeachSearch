const GOOGLE_SPREAD_SHEETS_KEY = '1E7hpYjYFQbxtb6emM3DgdwabrJzwE82_MtY0bzyLUe0';

google.charts
  .load('current', { packages: ['corechart'] })
  .then(async function () {
    const query = new google.visualization.Query(
      `http://spreadsheets.google.com/tq?key=${GOOGLE_SPREAD_SHEETS_KEY}&pub=1`,
    );
