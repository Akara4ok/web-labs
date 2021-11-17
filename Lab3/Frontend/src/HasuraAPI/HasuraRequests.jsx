async function fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch('https://subtle-dove-32.hasura.app/v1/graphql', {
        headers: {
            'content-type': 'application/json',
            'x-hasura-admin-secret':
                'SYfy99PqMy0EFUZ2evxFbwe4Q77eIeTdP5tibLRz2M0R1ZMjc8zrc0BEoUl1nm4M',
        },
        method: 'POST',
        body: JSON.stringify({
            query: operationsDoc,
            variables: variables,
            operationName: operationName,
        }),
    });

    return await result.json();
}

const operationsDoc = `
    query selectListName {
        ListName(order_by: { Id: asc }) {
            Id
            ListName
            Tasks(order_by: { Id: asc }) {
                Checked
                Id
                IdList
                TaskName
            }
        }
    }
    mutation deleteTask($Id: Int) {
        delete_Tasks(where: {Id: {_eq: $Id}}) {
          affected_rows
        }
      }
    mutation deleteList($Id: Int) {
        delete_ListName(where: {Id: {_eq: $Id}}) {
          affected_rows
        }
      }
    mutation addList($ListName: String) {
        insert_ListName(objects: {ListName: $ListName}) {
          returning {
            Id
          }
        }
      }
    mutation changeListName($Id: Int, $ListName: String) {
        update_ListName(where: {Id: {_eq: $Id}}, _set: {ListName: $ListName}) {
          affected_rows
        }
      }
    mutation addLine($IdList: Int, $TaskName: String) {
        insert_Tasks(objects: {IdList: $IdList, TaskName: $TaskName}) {
          returning {
            Id
          }
        }
      }
    mutation deleteLine($Id: Int) {
        delete_Tasks(where: {Id: {_eq: $Id}}) {
          affected_rows
        }
      }
    mutation changeLine($TaskName: String, $Id: Int) {
        update_Tasks(where: {Id: {_eq: $Id}}, _set: {TaskName: $TaskName}) {
          affected_rows
        }
      }
    mutation changeCheckBox($Id: Int, $Checked: Boolean) {
        update_Tasks(where: {Id: {_eq: $Id}}, _set: {Checked: $Checked}) {
          affected_rows
        }
      }

  `;

function fetchMyQuery(requst, variables) {
    return fetchGraphQL(operationsDoc, requst, variables);
}

export default async function startFetchMyQuery(requst, variables) {
    const { errors, data } = await fetchMyQuery(requst, variables);

    if (errors) {
        console.error(errors);
        return errors;
    }
    return data;
}
