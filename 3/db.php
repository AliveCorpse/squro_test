<?php
/*
    3. Напишите web страничку на которой можно работать с деревом:
     
        - внимание будет обращаться не только на функционал, но и на качество кода
        - PHP5+
        - узлы дерева это строковые элементы
        - добавление/изменение/перемещение/удаление элемента
        - возможность переименовать элемент по двойному щелчку мышкой
        - перемещение элементов перетягиванием мышкой (как в проводнике)
        - сворачивание/разворачивание/перемещение/удаление ветки дерева
        - состояние дерева хранится в БД SQLite 3
        - css оформление, кроссбраузерность, ajax приветствуется
        - бездумный копипаст с форумов и блогов не приветствуются
        - JS код для работы с деревом необходимо реализовать самостоятельно (а не использовать готовые библиотеки например jstree.com)
        - можно использовать jquery, плагины к нему и/или другие библиотеки, но не плагины/библиотеки реализующие функционал дерева
*/

error_reporting(E_ALL);

require_once __DIR__ . '/lib.php';
const DB_NAME = 'database.sqlite3';

if (!is_file(DB_NAME)) {
    $db = new SQLite3(DB_NAME);

    $sql = "CREATE TABLE categories(
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        parent_id INTEGER,
                        name TEXT
                    )";
    $db->exec($sql) or $db->lastErrorMsg();
}

$dbh = new \PDO('sqlite:' . DB_NAME);

$action = filter_input(INPUT_GET, 'action');

switch ($action) {
    case 'get_all':
        echo json_encode(getAllRecords($dbh));
        break;
    case 'save':
        if (!empty($_POST['id'])) {
            $sql = 'UPDATE categories
                SET parent_id=:parent_id, name=:name
                WHERE id=:id';
            $stmt = $dbh->prepare($sql);
            $stmt->execute([
                ':id'        => $_POST['id'],
                ':parent_id' => $_POST['parent_id'],
                ':name'      => $_POST['name'],
            ]);
            echo json_encode(true);
        } else {
            $sql = 'INSERT INTO categories (parent_id, name)
                    VALUES (:parent_id, :name)';
            $stmt = $dbh->prepare($sql);
            $stmt->execute([
                ':parent_id' => $_POST['parent_id'],
                ':name'      => $_POST['name'],
            ]);
            echo json_encode($dbh->lastInsertId());
        }
        break;
    case 'delete':
        if (isset($_POST['id'])) {
            $all_records = getAllRecords($dbh);
            $sql         = 'DELETE FROM categories WHERE id=:id';
            $stmt        = $dbh->prepare($sql);
            delRecursive($all_records, $_POST['id'], $stmt);

            echo json_encode(true);
        }
        break;
}
