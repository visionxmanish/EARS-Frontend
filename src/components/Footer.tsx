import { APP_CONFIG } from "@/constants/constants";
import { Label } from "@radix-ui/react-label";


export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="container mx-auto px-4 py-2">

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © {currentYear} {APP_CONFIG.author}. All rights reserved.
              <Label className="ml-2 text-blue-600">Version: 1.0.2</Label>
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <p className="text-sm text-gray-600">Software Department</p>
            </div>
          </div>

      </div>
    </footer>
  );
}
