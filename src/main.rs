use std::io;
use std::env;

pub fn main() -> io::Result<()> {
    let mut buffer = String::new();
    io::stdin().read_line(&mut buffer)?;

    let foo_var = env::var("FOO").unwrap_or("[foo]".to_string());

    println!("Hello {} {}", buffer, foo_var);
    Ok(())
}