use plotters::{prelude::*, style::full_palette::GREY_A100};
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
        //println!("{:?}", record);
        data.push(record);
       
    }
    return data;
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    
    println!("Creating a plot");

    let data = load_csv("data2.csv");

    //super non-effective lmao
    let max_x_val = data.iter().map(|x| x.x).fold(0./0., f64::max);
    let max_y_val = data.iter().map(|x| x.y).fold(0./0., f64::max);
    let min_x_val = data.iter().map(|x| x.x).fold(0./0., f64::min);
    let min_y_val = data.iter().map(|x| x.y).fold(0./0., f64::min);

    //draw background
    let root = BitMapBackend::new("plotters-doc-data/0.png", (640*2, 480*2)).into_drawing_area();
    root.fill(&GREY_A100)?;

    //create a chart with max and min values
    let mut chart = ChartBuilder::on(&root)
    .caption("scatter plot", ("sans-serif", 50).into_font())
    .margin( 5)
    .x_label_area_size(30)
    .y_label_area_size(30)
    .build_cartesian_2d((min_x_val - 5.0)..(max_x_val + 5.0), (min_y_val - 5.0)..(max_y_val + 5.0))?;

    chart.configure_mesh().draw()?;

    //koden är stekt sori :(
    let dot_and_label = |x: f64, y: f64, name:String | {
        if name == "a" || name == "foo" {
            return EmptyElement::at((x, y))
            + Circle::new((0, 0), 3, ShapeStyle::from(&RED).filled())
            // + Text::new(
            //     format!("{:}:({:.2},{:.2})", name, x, y),
            //     (10, 0),
            //     ("sans-serif", 15.0).into_font(),
            // );
        }
        else if name == "b" || name == "baz" {
            return EmptyElement::at((x, y))
            + Circle::new((0, 0), 3, ShapeStyle::from(&BLUE).filled())
            // + Text::new(
            //     format!("{:}:({:.2},{:.2})", name, x, y),
            //     (10, 0),
            //     ("sans-serif", 15.0).into_font(),
            // );
        }
        else {
            return EmptyElement::at((x, y))
            + Circle::new((0, 0), 3, ShapeStyle::from(&YELLOW).filled());
            // + Text::new(
            //     format!("{:}:({:.2},{:.2})", name, x, y),
            //     (10, 0),
            //     ("sans-serif", 15.0).into_font(),
            // );
        }
    };

    chart.draw_series(data.iter().map(|p| dot_and_label(p.x, p.y, p.name.clone())))?;

    root.present()?;

    println!("Plot created");
    Ok(())
}