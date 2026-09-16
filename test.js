fetch('https://docs.google.com/spreadsheets/d/1LvqrPR_KCD7WpZ-zr9Ow2YXIqIUYrh3dtKlGiBXX4FQ/edit').then(r => r.text()).then(t => {
  const matches = t.match(/"name":"([^"]+)"/g);
  if(matches) console.log(matches.slice(0, 20).join('\n'));
});
