<?php
// Database configuration
class Database {
    private $host = "localhost";
    private $username = "root";
    private $password = "";
    private $database = "library_management";
    private $connection;

    public function __construct() {
        $this->connect();
    }

    private function connect() {
        $this->connection = mysqli_connect(
            $this->host, 
            $this->username, 
            $this->password, 
            $this->database
        );

        if (!$this->connection) {
            die("Connection failed: " . mysqli_connect_error());
        }

        // Set charset to utf8
        mysqli_set_charset($this->connection, "utf8");
    }

    public function getConnection() {
        return $this->connection;
    }

    public function query($sql) {
        return mysqli_query($this->connection, $sql);
    }

    public function prepare($sql) {
        return mysqli_prepare($this->connection, $sql);
    }

    public function escape($string) {
        return mysqli_real_escape_string($this->connection, $string);
    }

    public function lastInsertId() {
        return mysqli_insert_id($this->connection);
    }

    public function affectedRows() {
        return mysqli_affected_rows($this->connection);
    }

    public function close() {
        if ($this->connection) {
            mysqli_close($this->connection);
        }
    }

    public function __destruct() {
        $this->close();
    }
}
?>
