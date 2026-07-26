import {
    useState,
} from "react";

import {
    Button,
    Input,
    Modal,
} from "@/shared/ui";

import {
    vpnNodeApi,
    type CreateVpnNodeDto,
} from "@/entities/vpn-node";


interface CreateVpnNodeModalProps {
    onCreated: () => void;
}


const initialForm: CreateVpnNodeDto = {
    name: "",

    host: "",

    port: 443,

    sshPort: 22,

    sshUser: "root",

    sshPassword: "",

};



const CreateVpnNodeModal = ({
                                onCreated,
                            }: CreateVpnNodeModalProps) => {

    const [isOpen, setIsOpen] =
        useState(false);


    const [isLoading, setIsLoading] =
        useState(false);


    const [form, setForm] =
        useState<CreateVpnNodeDto>(
            initialForm,
        );



    function updateField(
        field: keyof CreateVpnNodeDto,
        value: string | number,
    ) {

        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }



    async function handleSubmit() {

        setIsLoading(true);

        try {

            await vpnNodeApi.create(
                form,
            );


            setIsOpen(false);


            setForm(
                initialForm,
            );


            onCreated();


        } finally {

            setIsLoading(false);

        }
    }



    return (
        <>

            <Button
                onClick={() => setIsOpen(true)}
            >
                Добавить сервер
            </Button>


            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}

                title="Добавить VPN сервер"

                description="Введите параметры нового узла"
            >

                <div className="space-y-4">


                    <Input
                        label="Название"

                        placeholder="Germany #1"

                        value={form.name}

                        onChange={(event) =>
                            updateField(
                                "name",
                                event.target.value,
                            )
                        }
                    />


                    <Input
                        label="IP адрес"

                        placeholder="1.2.3.4"

                        value={form.host}

                        onChange={(event) =>
                            updateField(
                                "host",
                                event.target.value,
                            )
                        }
                    />


                    <div className="grid grid-cols-2 gap-4">

                        <Input
                            label="Порт"

                            type="number"

                            value={form.port}

                            onChange={(event) =>
                                updateField(
                                    "port",
                                    Number(
                                        event.target.value,
                                    ),
                                )
                            }
                        />


                        <Input
                            label="SSH порт"

                            type="number"

                            value={form.sshPort}

                            onChange={(event) =>
                                updateField(
                                    "sshPort",
                                    Number(
                                        event.target.value,
                                    ),
                                )
                            }
                        />

                    </div>



                    <Input
                        label="SSH пользователь"

                        value={form.sshUser}

                        onChange={(event) =>
                            updateField(
                                "sshUser",
                                event.target.value,
                            )
                        }
                    />

                    <Input
                        label="SSH пароль"
                        type="password"
                        value={form.sshPassword}
                        onChange={(event) =>
                            updateField(
                                "sshPassword",
                                event.target.value,
                            )
                        }
                    />



                </div>


                <div className="mt-6 flex justify-end gap-3">

                    <Button
                        variant="ghost"

                        onClick={() =>
                            setIsOpen(false)
                        }
                    >
                        Отмена
                    </Button>


                    <Button
                        isLoading={isLoading}

                        onClick={
                            handleSubmit
                        }
                    >
                        Создать сервер
                    </Button>

                </div>


            </Modal>

        </>
    );
};


export default CreateVpnNodeModal;