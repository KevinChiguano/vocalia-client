const XLSX = require('xlsx');
const path = require('path');

const data = [
    {
        DNI: '0999999991',
        Nombre: 'Kevin',
        Apellido: 'Guaman',
        Numero: 10,
        TeamId: '', // Opcional si se selecciona en el filtro
        CategoryId: '' // Opcional
    },
    {
        DNI: '0999999992',
        Nombre: 'Juan',
        Apellido: 'Perez',
        Numero: 7,
    },
    {
        DNI: '0999999993',
        Nombre: 'Maria',
        Apellido: 'Lopez',
        Numero: 1,
    }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Jugadores");

const outputPath = path.resolve(__dirname, '../public/players_example.xlsx');

XLSX.writeFile(workbook, outputPath);
console.log(`Example Excel file created at: ${outputPath}`);
