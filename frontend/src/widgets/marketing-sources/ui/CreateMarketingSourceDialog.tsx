import {
    useState,
} from "react";


import {
    Button,
    Input,
    Modal,
} from "@/shared/ui";


import {
    marketingSourceApi,
    type MarketingSourceType,
} from "@/entities/marketing-source";


import {
    getApiErrorMessage,
} from "@/shared/api";



interface Props {

    onCreated?: () => void;

}



const types: {
    value: MarketingSourceType;
    label: string;
}[] = [

    {
        value:"telegram",
        label:"Telegram",
    },

    {
        value:"tiktok",
        label:"TikTok",
    },

    {
        value:"blogger",
        label:"Блогер",
    },

    {
        value:"friend",
        label:"Друг",
    },

    {
        value:"other",
        label:"Другое",
    },

];



const CreateMarketingSourceDialog = ({
                                         onCreated,

                                     }:Props)=>{


    const [
        open,
        setOpen,
    ] =
        useState(false);



    const [
        name,
        setName,
    ] =
        useState("");



    const [
        code,
        setCode,
    ] =
        useState("");



    const [
        type,
        setType,
    ] =
        useState<MarketingSourceType>(
            "telegram"
        );



    const [
        isLoading,
        setIsLoading,
    ] =
        useState(false);



    const [
        error,
        setError,
    ] =
        useState<string|null>(null);




    const reset = ()=>{

        setName("");

        setCode("");

        setType("telegram");

        setError(null);

    };



    const create =
        async ()=>{


            setIsLoading(true);

            setError(null);


            try {


                await marketingSourceApi.create({

                    name,

                    code,

                    type,

                });


                setOpen(false);

                reset();


                onCreated?.();



            }catch(error:unknown){


                setError(
                    getApiErrorMessage(error)
                );


            }finally{

                setIsLoading(false);

            }

        };



    return (

        <>


            <Button
                onClick={()=>{
                    setOpen(true);
                }}
            >
                Создать источник
            </Button>



            <Modal

                isOpen={open}

                onClose={()=>{

                    setOpen(false);

                    reset();

                }}

                title="Создание источника"

            >


                <div className="space-y-4">


                    <Input

                        label="Название"

                        placeholder="Telegram канал Иван"

                        value={name}

                        onChange={(e)=>
                            setName(
                                e.target.value
                            )
                        }

                    />



                    <Input

                        label="Код"

                        placeholder="tg_ivan_august"

                        value={code}

                        onChange={(e)=>
                            setCode(
                                e.target.value
                            )
                        }

                    />



                    <div>

                        <label className="text-sm">
                            Тип
                        </label>


                        <select

                            className="mt-1 w-full rounded-md border px-3 py-2"

                            value={type}

                            onChange={(e)=>
                                setType(
                                    e.target.value as MarketingSourceType
                                )
                            }

                        >

                            {
                                types.map(
                                    item=>(

                                        <option

                                            key={
                                                item.value
                                            }

                                            value={
                                                item.value
                                            }

                                        >

                                            {
                                                item.label
                                            }

                                        </option>

                                    ))
                            }

                        </select>

                    </div>



                    {
                        error &&
                        (
                            <div className="text-sm text-red-600">
                                {error}
                            </div>
                        )
                    }



                    <Button

                        disabled={
                            isLoading ||
                            !name ||
                            !code
                        }

                        onClick={create}

                    >

                        {
                            isLoading
                                ?
                                "Создание..."
                                :
                                "Создать"
                        }

                    </Button>


                </div>


            </Modal>


        </>

    );

};


export default CreateMarketingSourceDialog;