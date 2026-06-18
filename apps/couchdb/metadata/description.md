# Apache CouchDB

O **Apache CouchDB** é um banco de dados NoSQL focado na facilidade de uso e na aderência total à arquitetura da Web. Ele armazena dados em formato **JSON (documentos)**, utiliza **JavaScript** como sua linguagem de consulta através de MapReduce e expõe uma API **HTTP/RESTful** nativa que permite interagir com o banco de dados diretamente pelo seu navegador ou qualquer cliente HTTP.

---

## Principais Recursos

* **Sincronização Bidirecional Nativa:** O CouchDB foi projetado desde o início com um protocolo de replicação robusto, ideal para sincronizar dados entre múltiplos servidores ou até mesmo dispositivos offline (usando ferramentas como PouchDB).
* **Arquitetura ACID:** Garante consistência e confiabilidade nas transações dos seus dados com uma estrutura baseada em *Append-Only* (as escritas não sobrescrevem dados diretamente, evitando corrupção de arquivos).
* **Interface Fauxton Embutida:** Acompanha uma interface administrativa web completa e moderna para gerenciar bancos de dados, visualizar documentos, configurar permissões e rodar consultas direto do navegador.

---

## Informações Adicionais para a Instalação

Ao instalar este aplicativo no Runtipi, as credenciais administrativas fornecidas no formulário de configuração inicial serão aplicadas automaticamente para criar o usuário administrador padrão do sistema. 

A interface administrativa do Fauxton pode ser acessada adicionando `/_utils` ao final da URL do seu aplicativo (ex: `http://seu-ip:5984/_utils` ou `https://couchdb.seu-dominio.com/_utils`).