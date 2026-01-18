import { AddEconomicData } from "./components/addEconomicData";

export default function ManageEconomicDataPage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Manage Economic Data</h1>
            <AddEconomicData />
        </div>
    );
}