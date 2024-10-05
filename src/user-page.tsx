import React, { useState, useEffect } from "react"
import { createServer } from "miragejs"

createServer({

    routes() {
        this.namespace = "api"

        let employees = [
            { id: 1, name: "Howard", position: 'developer' },
            { id: 2, name: "Monika", position: 'developer' },
            { id: 3, name: "Leonard", position: 'developer' },
            { id: 4, name: "Adam", position: 'HR' },
            { id: 5, name: "Eve", position: 'developer' },
            { id: 6, name: "Sheldon", position: 'Sr. developer' },
            { id: 7, name: "Penny", position: 'Manager' },
            { id: 8, name: "Raj", position: 'QA developer' },
            { id: 9, name: "Ross", position: 'Dev ops' },
            { id: 10, name: "Chandler", position: 'QA Developer' }
        ]

        this.get("/employees", () => {
            return employees
        })

        this.post("/employees/add", (schema, request) => {
            const maxId = employees.reduce((max, emp) =>
                emp.id > max ? emp.id : max, employees[0].id);

            let attrs = JSON.parse(request.requestBody);

            employees.push({ ...attrs, id: maxId + 1 })

            return employees;
        });

        this.put("/employees/:id", (schema, request) => {
            let id = parseInt(request.params.id);
            let attrs = JSON.parse(request.requestBody);

            employees = employees.map(emp =>
                emp.id === id ? { ...emp, ...attrs } : emp
            );

            return { employee: employees.find(emp => emp.id === id) };
        });

        this.delete("/employees/:id", (schema, request) => {
            let id = parseInt(request.params.id);
            employees = employees.filter(emp => emp.id !== id);
            return employees;
        });
    },


})

export type EmpType = {
    id?: number
    name?: string,
    position?: string
}

export const UserPage = () => {
    const [emps, setEmps] = useState<EmpType[]>([]);
    const [empId, setEmpId] = useState<number>();
    const [isForm, setIsform] = useState<boolean>(false);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [isAddBtn, setIsAddBtn] = useState<boolean>(true);
    const [empData, setEmpData] = useState<EmpType>();

    useEffect(() => {
        fetch("/api/employees")
            .then((response) => response.json())
            .then((json) => setEmps(json))
    }, [])

    const deleteEmp = (id?: number) => {
        fetch(`/api/employees/${id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((json) => { setEmps(json); alert('Entry Removed, Please check Employees list!') })
    }

    const handleAddClick = (e) => {
        e.preventDefault();
        fetch(`/api/employees/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(empData),
        })
            .then((res) => res.json())
            .then((data) => {
                setEmps(data);
                alert('Entry Added, Please check Employees list!')
            });
    }

    const handleEdit = (emp: EmpType) => {
        setIsform(true);
        setIsUpdate(true);
        setIsAddBtn(false);
        setEmpData(emp);
    }

    const updateData = (e) => {
        e.preventDefault();

        fetch(`/api/employees/${empData?.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(empData),
        })
            .then((res) => res.json())
            .then((data) => {
                setEmps((prevEmployees) =>
                    prevEmployees.map((emp) =>
                        emp.id === empData?.id ? data.employee : emp
                    )
                );
                alert('Entry Updated, Please check Employees list!')
            });
    }

    const reset = () => {
        setIsAddBtn(true);
        setIsform(false);
        setEmpData({});
        setIsUpdate(false)
    }

    return (
        <div className=" p-20">
            <div id="emp-list" className="flex flex-col justify-center gap-6 items-center ">
                <div className="flex gap-10 justify-between w-full">
                    <h2 className="text-[24px] w-full">Employee ID</h2>
                    <h2 className="text-[24px] w-full">Name</h2>
                    <h2 className="text-[24px] w-full">Position</h2>
                    <h2 className="text-[24px]">Action</h2>
                </div>
                <div className="flex w-full flex-col gap-5">
                    {
                        emps?.map((emp, idx) => (
                            <div className="flex gap-10 justify-between items-center">
                                <h2 className="text-[18px] w-full">{emp.id}</h2>
                                <h2 className="text-[18px] w-full">{emp.name}</h2>
                                <h2 className="text-[18px] w-full">{emp.position}</h2>
                                <div className="flex gap-2">
                                    <div className="border-[1px] border-solid border-[#000] p-2 w-full">
                                        <button onClick={() => { handleEdit(emp) }}>Edit</button>
                                    </div>
                                    <div className="bg-[#ef2e2e] p-2 w-full text-[#fff]">
                                        <button onClick={() => deleteEmp(emp?.id)}>Delete</button>
                                    </div>

                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>

            <div id="emp-operations" style={{ width: 'fit-content' }} className="flex flex-col gap-5 pt-20">
                {
                    isAddBtn && !isForm &&
                    <div id="add-btn" onClick={() => setIsform(!isForm)} className="bg-[#4eba46] p-2 w-fullb text-[#fff] cursor-pointer">
                        <span>{'Add Employee'}</span>
                    </div>
                }

                {
                    isForm &&
                    <form id="form-section" className="flex flex-col gap-5" onSubmit={isUpdate ? updateData : handleAddClick}>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="name">Enter Employee name</label>
                            <input required className="p-2 border-[1px] border-solid border-[#555a66]" type="text" name="name" value={empData?.name} onChange={(e) => setEmpData((prev) => { return { ...prev, name: e.target.value } })} />

                            <label htmlFor="position">Enter Employee Position</label>
                            <input className="p-2 border-[1px] border-solid border-[#555a66]" type="text" name="position" value={empData?.position} onChange={(e) => setEmpData((prev) => { return { ...prev, position: e.target.value } })} />
                        </div>
                        <div className="flex gap-2">
                            <input type="submit" className="border-[1px] border-dotted border-[#000] p-1 cursor-pointer w-full" key={'submit-btn'} value={isUpdate ? 'Update' : 'Add'} />
                            <div className=" border-[1px] border-dotted border-[#000] p-1 w-full cursor-pointer">
                                <button onClick={reset}>Cancel</button>
                            </div>
                        </div>
                    </form>
                }
            </div>
        </div>

    )
}