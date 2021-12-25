import {prodQuestions} from "../utilites/questions";

const List = () => {
    console.log('prodQuestions',prodQuestions)

    return <div>
        {prodQuestions.map( group => {
            return <div key={group.id}>
                <h2>{group.category}</h2>
                <table width={"100%"} border={"1"}>
                    <thead>
                        <th>Вопрос</th>
                        <th>Ответ</th>
                        <th>Очки</th>
                    </thead>
                    <tbody>
                        {
                            group.questions.map( question => <tr>
                                <td>{question.text}</td>
                                <td>{question.answer}</td>
                                <td>{question.score}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        })}
    </div>;
};

export default List;