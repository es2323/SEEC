# backend/your_app_name/import_timetable.py

import csv
from datetime import datetime
from .models import BusRoute, BusStop, Journey, StopTime
from django.core.management import call_command
from django.db import transaction

def import_timetable_from_csv(csv_file_path, route_name="Your Bus Route"):
    """Imports bus timetable data from a CSV file."""
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            headers = next(reader)  # Get the first row as journey codes
            stop_names = []
            for row in reader:
                stop_names.append(row[0])  # First column is stop name

            # Create or get the BusRoute
            bus_route, created = BusRoute.objects.get_or_create(route_name=route_name)

            # Create or get BusStops
            bus_stops = {}
            for i, name in enumerate(stop_names):
                stop, created = BusStop.objects.get_or_create(stop_name=name)
                bus_stops[name] = (stop, i)  # Store stop object and its sequence

            with transaction.atomic():
                # Process each journey (each column in the CSV after the first)
                for i, journey_code in enumerate(headers[1:]):
                    journey, created = Journey.objects.get_or_create(journey_code=journey_code, route=bus_route)

                    # Process stop times for this journey
                    for stop_name, (stop, sequence) in bus_stops.items():
                        arrival_time_str = reader[sequence][i + 1]  # Adjust index for journey and stop
                        arrival_time = None
                        if arrival_time_str and arrival_time_str != '-':
                            try:
                                arrival_time = datetime.strptime(arrival_time_str, '%H:%M').time()
                            except ValueError:
                                print(f"Warning: Could not parse time '{arrival_time_str}' for journey {journey_code} at stop {stop_name}. Skipping.")

                        StopTime.objects.create(
                            journey=journey,
                            stop=stop,
                            arrival_time=arrival_time,
                            stop_sequence=sequence + 1  # Sequence starts from 1
                        )
        print("Timetable data imported successfully!")

    except FileNotFoundError:
        print(f"Error: CSV file not found at {csv_file_path}")
    except Exception as e:
        print(f"An error occurred during import: {e}")

if __name__ == "__main__":
    # Replace 'path/to/your/timetable.csv' with the actual path to your CSV file
    CSV_FILE_PATH = r"C:\Users\enosh\Downloads\SEEC_RA_Timetable_OB.csv"
    import_timetable_from_csv(CSV_FILE_PATH)