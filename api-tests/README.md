# Robot tests

## Requirements

-   Python (tested with 3.9.7)
-   [Pyenv](https://github.com/pyenv/pyenv)

## Installation

**First time**

Create python env

```$ python3 -mvenv .env```

Activate python env

```$ source .env/bin/activate```

Install python dependencies

```(.env) $ pip3 install -r requirements.txt```

**Later**

```$ source .env/bin/activate```

If there have been dependency changes, re-install Python dependencies.

## IDE support

Robot Code for VSCode:

```code --install-extension d-biehl.robotcode```

## Docs and reading

## Usage

**Prepare**

Add auth tokens in the `tokens.json` file. This may be done manually, or using the utility script

```python FetchAuthToken.py```

The `tokens.json` file structure should be similar to:

```
{
    "self.viewer@lkv.xxx": "the_token_here",
    "viewer@lkv.xxx": "the_token_here",
    "paakayttaja.toimisto@lkv.xxx": "the_token_here"
    "paakayttaja.organisaatio@lkv.xxx": "the_token_here"
}
```

Generate OpenAPI schema in json format to be used to validate the GET endpoints responses

```(.env) $ python3 utils/createSchema.py```

this will create `api-schema.json` file

Set API url in environment variable API_URL

```export API_URL=https://api-feature-oviproapi1774.dev-ovipro.net```

**Running the tests**

Tests need to be run from python env

Run all tests

```(.env) $ robot -d reports endpoints/```

Run a specific test suite

```(.env) $ robot -d reports endpoints/assetRequirements/CreateRequest.robot```

```(.env) $ robot -d reports endpoints/assetRequirements/ReadRequest.robot```

```(.env) $ robot -d reports endpoints/assetRequirements/RemoveRequest.robot```

```(.env) $ robot -d reports endpoints/assetRequirements/UpdateRequest.robot```

```(.env) $ robot -d reports endpoints/estateProperties/CreateRequest.robot```

```(.env) $ robot -d reports endpoints/estateProperties/ReadRequest.robot```

```(.env) $ robot -d reports endpoints/estateProperties/RemoveRequest.robot```

```(.env) $ robot -d reports endpoints/estateProperties/UpdateRequest.robot```

```(.env) $ robot -d reports endpoints/otherProperties/CreateRequest.robot```

```(.env) $ robot -d reports endpoints/otherProperties/ReadRequest.robot```

```(.env) $ robot -d reports endpoints/otherProperties/RemoveRequest.robot```

```(.env) $ robot -d reports endpoints/otherProperties/UpdateRequest.robot```

```(.env) $ robot -d reports endpoints/otherShares/CreateRequest.robot```

```(.env) $ robot -d reports endpoints/otherShares/ReadRequest.robot```

```(.env) $ robot -d reports endpoints/otherShares/RemoveRequest.robot```

```(.env) $ robot -d reports endpoints/otherShares/UpdateRequest.robot```

```(.env) $ robot -d reports endpoints/residentialProperties/CreateRequest.robot```

```(.env) $ robot -d reports endpoints/residentialProperties/ReadRequest.robot```

```(.env) $ robot -d reports endpoints/residentialProperties/RemoveRequest.robot```

```(.env) $ robot -d reports endpoints/residentialProperties/UpdateRequest.robot```

```(.env) $ robot -d reports endpoints/residentialShares/CreateRequest.robot```

```(.env) $ robot -d reports endpoints/residentialShares/ReadRequest.robot```

```(.env) $ robot -d reports endpoints/residentialShares/RemoveRequest.robot```

```(.env) $ robot -d reports endpoints/residentialShares/UpdateRequest.robot```

```(.env) $ robot -d reports endpoints/showings/CreateRequest.robot```

```(.env) $ robot -d reports endpoints/showings/ReadRequest.robot```

```(.env) $ robot -d reports endpoints/showings/RemoveRequest.robot```

```(.env) $ robot -d reports endpoints/showings/UpdateRequest.robot```

```(.env) $ robot -d reports endpoints/realties/ReadRequest.robot```

```(.env) $ robot -d reports endpoints/realties/SearchRequest.robot```
