#include <iostream>
#include <filesystem>
#include <cstdlib>
using namespace std;
namespace fs = std::filesystem;

int main()
{
    string path = fs::current_path().string();

    if(path.find("backend") != string::npos)
    {
        if(!(fs::exists("node_modules")))
        {
            system("npm install");
        }

        system("npm start");
    }
    else if(fs::exists("backend") and fs::is_directory("backend"))
    {
        if(!(fs::exists("backend/node_modules")))
        {
            system("cd backend && npm install");
        }

        system("cd backend && npm start");
    }
    else
    {
        cout << "backend folder not found\n";
    }

    string cmd;
    while(true)
    {
        cin >> cmd;
        if(cmd == "exit") break;
    }
}