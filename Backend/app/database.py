from sqlmodel import SQLModel, create_engine, Session, select
from datetime import datetime, timezone
from app.config import settings
from app.models import Category, Venue, Event, Role, User, Payment, Order, Seat, Ticket

# Using SQLModel library as ORM
# Configuring the database setup
# `echo=True` enables sqlmodel logging, outputting SQL statements to the console (useful for debugging)
engine = create_engine(settings.DATABASE_URL, echo=True)


# Function to create database and tables
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


# Function to get a database session, providing a session object for CRUD operations
# Context manager is used to ensure the session is properly closed after use
def get_session():
    with Session(engine) as session:
        yield session


# Seeds the database with a small set of real, publicly announced upcoming
# concert dates (as of Sept 2026) so the app has something to display on
# first run. Only runs if there are no events in the database yet, so it
# never overwrites or duplicates real data added later.
def seed_initial_events():
    with Session(engine) as session:
        existing = session.exec(select(Event)).first()
        if existing:
            return  # Already has data (seeded or user-added) — do nothing.

        category = Category(Name="Music")
        session.add(category)
        session.commit()
        session.refresh(category)

        venues_data = [
            {
                "Name": "PeoplesBank Arena",
                "Location": "Hartford, CT",
                "Capacity": 16000,
                "Type": "Arena",
            },
            {
                "Name": "SoFi Stadium",
                "Location": "Inglewood, CA",
                "Capacity": 70000,
                "Type": "Stadium",
            },
            {
                "Name": "United Center",
                "Location": "Chicago, IL",
                "Capacity": 20900,
                "Type": "Arena",
            },
            {
                "Name": "BC Place",
                "Location": "Vancouver, BC",
                "Capacity": 54500,
                "Type": "Stadium",
            },
            {
                "Name": "Madison Square Garden",
                "Location": "New York, NY",
                "Capacity": 20789,
                "Type": "Arena",
            },
        ]
        venues = []
        for v in venues_data:
            venue = Venue(**v)
            session.add(venue)
            venues.append(venue)
        session.commit()
        for venue in venues:
            session.refresh(venue)

        # Deterministic placeholder photography (Lorem Picsum) keyed per event
        # so each card gets a distinct image without relying on any specific
        # artist's copyrighted promotional photo.
        def img(seed: str) -> str:
            return f"https://picsum.photos/seed/{seed}/1200/800"

        events_data = [
            {
                "Name": "Olivia Rodrigo - The Unraveled Tour",
                "Description": "Olivia Rodrigo kicks off The Unraveled Tour in support of her third studio album.",
                "ImageUrl": img("olivia-rodrigo-hartford"),
                "Date": datetime(2026, 9, 25, 19, 0, tzinfo=timezone.utc),
                "Status": "On Sale",
                "TotalTickets": 16000,
                "AvailableTickets": 16000,
                "VenueID": venues[0].VenueID,
            },
            {
                "Name": "Bruno Mars - The Romantic Tour",
                "Description": "Bruno Mars brings The Romantic Tour to SoFi Stadium with special guest Anderson .Paak as DJ Pee .Wee.",
                "ImageUrl": img("bruno-mars-sofi"),
                "Date": datetime(2026, 9, 30, 19, 0, tzinfo=timezone.utc),
                "Status": "On Sale",
                "TotalTickets": 70000,
                "AvailableTickets": 70000,
                "VenueID": venues[1].VenueID,
            },
            {
                "Name": "Olivia Rodrigo - The Unraveled Tour",
                "Description": "The Unraveled Tour continues with a multi-night stand at Chicago's United Center.",
                "ImageUrl": img("olivia-rodrigo-chicago"),
                "Date": datetime(2026, 10, 11, 19, 0, tzinfo=timezone.utc),
                "Status": "On Sale",
                "TotalTickets": 20900,
                "AvailableTickets": 20900,
                "VenueID": venues[2].VenueID,
            },
            {
                "Name": "Bruno Mars - The Romantic Tour",
                "Description": "The Romantic Tour heads north for a stadium show at BC Place, Vancouver.",
                "ImageUrl": img("bruno-mars-vancouver"),
                "Date": datetime(2026, 10, 14, 19, 0, tzinfo=timezone.utc),
                "Status": "On Sale",
                "TotalTickets": 54500,
                "AvailableTickets": 54500,
                "VenueID": venues[3].VenueID,
            },
            {
                "Name": "Harry Styles - Together, Together",
                "Description": "Harry Styles' 30-show Madison Square Garden residency, part of his Together, Together world tour.",
                "ImageUrl": img("harry-styles-msg"),
                "Date": datetime(2026, 10, 2, 20, 0, tzinfo=timezone.utc),
                "Status": "On Sale",
                "TotalTickets": 20789,
                "AvailableTickets": 20789,
                "VenueID": venues[4].VenueID,
            },
        ]
        events = []
        for e in events_data:
            event = Event(CategoryID=category.CategoryID, **e)
            session.add(event)
            events.append(event)
        session.commit()
        for event in events:
            session.refresh(event)

        # Also seeds a demo account with a couple of tickets already
        # attached, so the "My Tickets" feature has something real to view
        # and transfer without needing a full checkout flow first.
        _seed_demo_account_and_tickets(session, venues, events)


def _seed_demo_account_and_tickets(session: Session, venues, events):
    role = session.exec(select(Role).where(Role.Name == "Customer")).first()
    if not role:
        role = Role(Name="Customer")
        session.add(role)
        session.commit()
        session.refresh(role)

    demo_email = "demo@ticketmaster.dev"
    demo_user = session.exec(select(User).where(User.Email == demo_email)).first()
    if not demo_user:
        demo_user = User(
            Email=demo_email,
            FirstName="Demo",
            LastName="User",
            PasswordHash=User.hash_password("Demo1234!"),
            RoleID=role.RoleID,
        )
        session.add(demo_user)
        session.commit()
        session.refresh(demo_user)

    payment = Payment(PaymentMethod="Card", Status="Completed", Amount=598.00)
    session.add(payment)
    session.commit()
    session.refresh(payment)

    order = Order(TotalAmount=598.00, UserID=demo_user.UserID, PaymentID=payment.PaymentID)
    session.add(order)
    session.commit()
    session.refresh(order)

    seat1 = Seat(SeatNumber="12", Section="Floor A", Row="4", VenueID=venues[0].VenueID)
    seat2 = Seat(SeatNumber="7", Section="Lower Bowl", Row="12", VenueID=venues[4].VenueID)
    session.add(seat1)
    session.add(seat2)
    session.commit()
    session.refresh(seat1)
    session.refresh(seat2)

    ticket1 = Ticket(
        Number="TM-OR-0001",
        Amount=299.00,
        OrderID=order.OrderID,
        SeatID=seat1.SeatID,
        EventID=events[0].EventID,  # Olivia Rodrigo - Hartford
    )
    ticket2 = Ticket(
        Number="TM-HS-0001",
        Amount=299.00,
        OrderID=order.OrderID,
        SeatID=seat2.SeatID,
        EventID=events[4].EventID,  # Harry Styles - MSG
    )
    session.add(ticket1)
    session.add(ticket2)
    session.commit()
