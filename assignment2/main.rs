use plotters::prelude::*;
use serde::{Deserialize};


#[derive(Debug, Deserialize)]
struct Data {
    x: f64,
    y: f64,
    name: String,
}

fn load_csv(filename: &str) -> Vec<Data> {

    //let mut rdr = csv::Reader::from_path(filename).unwrap();

    //create a reader for the csv files
    let mut reader = csv::ReaderBuilder::new()
    .has_headers(false)
    .from_path(filename)
    .unwrap();

    //vector for the data using struct Data
    let mut data: Vec<Data> = Vec::new();

    //iterate through the csv file
    for result in reader.deserialize() {

        let record: Data = result.unwrap();
        println!("{:?}", record);
        data.push(record);
       
    }
    return data;
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    
    println!("Creating a plot");

    let data = load_csv("data2.csv");


    let root = BitMapBackend::new("plotters-doc-data/0.png", (640, 480)).into_drawing_area();
    root.fill(&WHITE)?;
    let mut chart = ChartBuilder::on(&root)
        .caption("y=x^2", ("sans-serif", 50).into_font())
        .margin(5)
        .x_label_area_size(30)
        .y_label_area_size(30)
        .build_cartesian_2d(-1f32..1f32, -0.1f32..1f32)?;

    chart.configure_mesh().draw()?;

    chart
        .draw_series(LineSeries::new(
            (-50..=50).map(|x| x as f32 / 50.0).map(|x| (x, x * x)),
            &RED,
        ))?
        .label("y = x^2")
        .legend(|(x, y)| PathElement::new(vec![(x, y), (x + 20, y)], &RED));

    chart
        .configure_series_labels()
        .background_style(&WHITE.mix(0.8))
        .border_style(&BLACK)
        .draw()?;

    root.present()?;

    println!("Plot created");
    Ok(())
}