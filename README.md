Hamro Khata is a simple web application designed to help retailers manage credit (udhaar) transactions digitally instead of using traditional paper ledgers. 
To get started, you’ll need a few basic tools installed on your system, including .NET 8 SDK, Node.js (version 18 or higher), Angular CLI, and SQL Server. 
The database structure is already included in the project, but if needed, you can recreate it by running the provided SQL script.
Once the database is ready, you can start the backend by navigating to the API folder and running the project,
which will make the service available locally along with a Swagger interface for testing.
After that, launch the frontend by navigating to the UI folder and running the Angular development server, which will open the application in your browser.

The system is divided into three main parts: the backend API, which handles authentication, customers, and transactions; the frontend interface, 
where users interact with the system; and the database, where all records are stored. 
With Hamro Khata, users can register and log in, add and manage customers, record credit and payments, and view detailed ledgers for each customer. 
It also includes a feature to share a public ledger link when needed.
For everything to work smoothly, make sure your SQL Server is running and the connection settings are correctly configured, 
and always run both the backend and frontend at the same time