<?php
/*
 * 1. Есть одномерный массив (размер произвольный) чисел больше 0.
 * Задача вывести все его элементы в 7 колонок, в таблице с border="1".
 * У пустых ячеек должна быть рамка.
 */

error_reporting(E_ALL);

function arrayAsTable($array, $columns)
{
    $index = 0;
    do {
        $part = [];
        $part = array_slice($array, $index, $columns);
        $index += $columns;

        echo '<tr>';
        for ($i = 0; $i < $columns; $i++) {
            if (array_key_exists($i, $part)) {
                echo '<td>' . $part[$i] . '</td>';
            } else {
                echo '<td></td>';
            }
        }
        echo '</tr>';
        
    } while ($index < count($array));
}

$array = range(0, rand(1, 50));
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Table</title>
</head>
<body>
<table border="1">
    <?php
    arrayAsTable($array, 7);
    ?>
</table>
</body>
</html>
